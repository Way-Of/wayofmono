# Shared Mesh Replication Protocol (v1)

[← Docs index](./README.md)

This document is the canonical contract for Fusion multi-leader mesh replication.

## 1. Goals and non-goals

### Goals
- Preserve one shared durable project state across multiple nodes.
- Keep task and planning state strongly coordinated by default.
- Allow local progress during peer outages via durable queues.
- Support deterministic replay/reconciliation after recovery.
- Expose read staleness so clients can decide whether to trust last-known global state.

### Non-goals (for v1)
- Full runtime scheduler failover.
- Full live-process state migration.
- Immediate global consistency for every data class.

## 2. Terms

- **Node**: A Fusion runtime instance participating in mesh sync.
- **Coordinator**: Node currently responsible for committing a write intent.
- **Intent**: Durable write proposal before global ack quorum completes.
- **Envelope**: Wire record carrying replication metadata + payload.
- **Epoch**: Monotonic lease/fencing generation for coordinator authority.
- **Fence token**: `epoch + coordinatorNodeId + sequence` token that invalidates stale coordinators.
- **Queue entry**: Durable locally-accepted write waiting for replay.

## 3. Versioning

- Protocol id: `fusion.shared-mesh`
- Initial version: `1.0`
- All envelopes must include `{ protocol, version }`.
- Minor versions (`1.x`) are backward-compatible additive.
- Major versions (`2.0+`) may change semantics and require explicit compatibility checks.

## 4. Data-class coordination matrix

| Data class | Mode | Notes |
|---|---|---|
| Tasks (core fields, deps, steps, column transitions) | Strongly coordinated | Quorum-acked intent/commit path; replayable with fencing |
| Task metadata (priority, model overrides, docs metadata refs) | Strongly coordinated | Same write path as tasks |
| Missions/milestones/slices/features | Strongly coordinated | Ordered writes preserve hierarchy invariants |
| Agent definitions/configuration | Strongly coordinated | Durable config replicated; runtime process handles excluded |
| Agent runtime state (heartbeat ticks, local process internals, worktree paths) | Node-local only | Exposed as local telemetry, not global truth |
| Project settings | Strongly coordinated | Existing settings payloads remain canonical payload shape |
| Auth material / provider credentials | Queued-for-later (secured transport only) | Explicit auth snapshot channel (`sharedState.authMaterial`); never merged as ordinary settings payload |
| Execution runs / live activity streams | Node-local + queued summary | Live events local; durable run outcomes appended later |
| Audit / event streams (`activityLog`, `runAuditEvents`) | Append-only replicated | Immutable event replication with origin metadata |
| Filesystem blobs (`.fusion/tasks/*` prompts/logs/attachments) | Queued-for-later | Metadata in replicated records, blob transfer out-of-band |

## 5. Write classes

- **`strong`**: Requires coordinator fence + quorum ack before `committed`.
- **`append-only`**: Event-style immutable replication; dedupe by event id.
- **`queued`**: Accept locally when peers unavailable; replay later.
- **`local`**: Never replicated globally.

## 6. Replication envelope

Every replicated record uses:
- `protocol`, `version`
- `recordId`, `entityType`, `entityId`
- `originNodeId`, `originSeq`
- `writeClass`
- `leaseEpoch`, `fenceToken`
- `intentId` and `state` (`intent` | `committed` | `rejected` | `queued` | `reconciled`)
- `createdAt`, `committedAt?`
- `payload`
- `precondition?` (base revision / expected epoch)

`PeerSyncRequest` / `PeerSyncResponse` remain mesh exchange carriers. v1 envelopes are payloads exchanged through current mesh sync infrastructure and follow-on sync endpoints.

### Auth snapshot contract (v1)

Auth replication uses `AuthMaterialSnapshot` (`version`, `exportedAt`, `checksum`, `payload`) with:
- `payload.providerAuth: Record<string, ProviderAuthEntry>`
- `ProviderAuthEntry.type`: `api_key | oauth`
- `api_key` fields: `key`
- `oauth` fields: `accessToken`, `refreshToken`, `expires`, optional `accountId`

Transport paths:
- Mesh shared-state channel: `POST /api/mesh/sync` (`sharedState.authMaterial`)
- Explicit node auth channel: `POST /api/nodes/:id/auth/sync` and inbound `POST /api/settings/auth-receive` / `GET /api/settings/auth-export`

Security/redaction rules:
- Auth snapshots are only exchanged over API-key-authenticated node links.
- Raw secrets (`key`, `accessToken`, `refreshToken`, bearer headers) MUST NOT be logged.
- Route diagnostics may emit provider names/counts only.

## 7. Quorum and acknowledgements

For `strong` writes:
1. Coordinator accepts intent locally.
2. Coordinator requests acknowledgements from peers in current membership view.
3. Commit requires `quorum = floor(eligibleVoters / 2) + 1` including coordinator.
4. If quorum fails before timeout, intent becomes `queued` with retry metadata.

`append-only` writes can be accepted locally and replicated asynchronously, but must preserve origin ordering `(originNodeId, originSeq)`.

## 8. Lease epochs and fencing

- Coordinator authority is leased with a monotonic `leaseEpoch`.
- Any write with stale epoch/fence must be rejected (`fenced`).
- Restarted nodes must reacquire lease and increment epoch before coordinating strong writes.
- Replay workers must carry original fence metadata; reconciler can reject stale queued entries after epoch advancement.

## 9. Offline queueing and replay

When a strong/queued write cannot reach quorum:
- Persist queue entry durably with:
  - `intentId`, `entityType`, `entityId`, `writeClass`
  - `originNodeId`, `originSeq`, `leaseEpoch`, `fenceToken`
  - retry counters, first/last attempt timestamps, next attempt time
- Local node may expose optimistic local result as `queued` only (not globally committed).

Replay ordering:
1. Sort by `(leaseEpoch asc, originSeq asc, createdAt asc, intentId asc)`.
2. Re-validate preconditions and fence tokens.
3. Commit, reject, or reconcile with deterministic outcome.

## 10. Reconciliation

Reconciliation outcomes are explicit:
- `applied` — replayed successfully.
- `noop_already_applied` — idempotent duplicate.
- `superseded` — newer committed revision already exists.
- `conflict_requires_merge` — semantic conflict; requires policy/agent/manual resolution.
- `rejected_fenced` — stale epoch/fence.

Conflict policy must never silently downgrade strong writes to local-only updates.

## 11. Restart recovery hooks

On node startup:
1. Load durable queue.
2. Rebuild last known lease epoch / origin sequence.
3. Mark in-flight intents without terminal state as `queued` recovery candidates.
4. Start replay loop only after mesh membership snapshot and lease status are known.

## 12. Degraded reads and staleness

Read responses for shared entities include staleness metadata:
- `source`: `local-committed` | `local-queued` | `replica`
- `lastGlobalCommitAt`
- `replicationLagMs`
- `queueDepth`
- `isStale`

In degraded mode, clients may read last-known global state plus queued-local overlays, but must be able to distinguish them.

## 13. End-to-end v1 write path

1. **Intent creation**: Node creates write intent + envelope.
2. **Coordinator selection**: Node routes to current coordinator lease holder for the entity scope.
3. **Commit/ack**:
   - strong: quorum commit
   - append-only: local append + async replication
4. **Fallback**: if unreachable/quorum-fail, persist queue entry (`queued`).
5. **Replay**: on recovery, replay durable queue in canonical order with fencing checks.
6. **Reconciliation**: produce explicit outcome and update entity revision state.

## 14. Contract for FN-3449 through FN-3456

Follow-on tasks must implement against this contract and not redefine it:
- **FN-3449**: distributed ids/origin sequence allocation + monotonic ordering.
- **FN-3450**: coordinator selection and lease management runtime.
- **FN-3451**: strong-write commit path + quorum ack handling.
- **FN-3452**: durable offline queue persistence and replay engine.
- **FN-3453**: reconciliation executor + conflict outcome handling.
- **FN-3454**: restart recovery bootstrap and in-flight intent recovery.
- **FN-3455**: degraded-read APIs exposing staleness metadata.
- **FN-3456**: partition behavior policy, observability, and operator controls.

## 15. Security boundary

- Mesh transport authentication (node API keys / trust) is mandatory for replication traffic.
- Auth credential replication is explicit and separately controlled from ordinary settings replication.
- Sensitive payloads must be redacted from non-secure logs and diagnostics.
