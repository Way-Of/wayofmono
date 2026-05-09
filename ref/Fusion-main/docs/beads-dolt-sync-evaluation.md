# Beads and Dolt Evaluation for Fusion Node Sync

[← Docs index](./README.md)

## Summary

Recommendation: **do not switch Fusion wholesale to either Beads or Dolt for node sync right now**.

Use them as design references or optional experiments, but keep Fusion’s current SQLite + filesystem hybrid model and add an explicit Fusion-native sync layer.

| Option | Recommendation |
|---|---|
| Beads | Useful inspiration for local-first issue/task sync, but too domain-specific to become Fusion’s persistence or sync substrate. |
| Dolt | Technically interesting for versioned relational data and SQL merge semantics, but too heavy and operationally different from Fusion’s embedded SQLite model. Consider only as an experimental backend or audit/export target. |
| Best path | Keep SQLite. Add a Fusion-native sync protocol based on append-only change events, per-record revisions, deterministic conflict policies, and blob transfer for `.fusion/tasks/*`. |

## Fusion’s Current Sync Requirements

Fusion is more than a task board. Current persistence includes:

- Project DB: `.fusion/fusion.db`
- Central DB: `~/.fusion/fusion-central.db`
- Filesystem blobs: `.fusion/tasks/{ID}/PROMPT.md`, logs, attachments
- Project tables for tasks, agents, activity logs, missions, roadmaps, workflow steps, chat, insights, audit events, and more
- Central multi-node metadata including `nodes`, `peerNodes`, `settingsSyncState`, project routing, health, and global concurrency

Node sync needs to handle:

1. Task metadata
2. Task lifecycle transitions
3. Agent state and heartbeats
4. Settings sync
5. Mission, roadmap, and todo data
6. Attachments and task files
7. Conflict detection
8. Offline edits
9. Partial peer availability
10. Security and authentication per node

The sync layer needs to be more general than an issue tracker sync model.

## Beads Evaluation

Beads is attractive because it appears philosophically aligned with Fusion:

- Local-first
- CLI-friendly
- Task/issue oriented
- Git-friendly or file/db-backed sync model
- Human-readable workflows
- Good fit for small project issue tracking

### Potential Uses

Beads could be useful as inspiration for:

- Task IDs
- Dependency graph semantics
- Syncing issue-like records
- Minimal local-first UX
- Conflict-tolerant issue updates
- Import/export interoperability

### Problems as Fusion’s Backend

#### Domain mismatch

Fusion tasks are only one part of the data model. Fusion also has:

- Agents
- Agent ratings
- Heartbeat runs
- AI sessions/messages
- Workflow steps
- Missions, milestones, slices, and features
- Roadmaps
- Settings
- Node registry
- Run audit events
- Attachments and logs

Beads is likely optimized around issues, not full distributed orchestration state.

#### Schema constraints

If Fusion uses Beads as the substrate, Fusion either:

- Adopts Beads’ issue model and loses domain expressiveness, or
- Stores Fusion-specific JSON payloads inside Beads, turning Beads into an awkward blob store.

Neither is ideal.

#### Sync granularity mismatch

Fusion needs record-level and event-level sync with explicit lifecycle semantics.

Example:

- Node A moves `FN-123` from `todo` to `in-progress`
- Node B edits title/description
- Node C assigns `nodeId`
- An agent heartbeat writes progress
- A reviewer moves the task to `in-review`

Fusion needs deterministic merge rules per field and per event type. Beads is unlikely to provide that across Fusion’s full schema.

#### Runtime state should not sync like tasks

Some Fusion data is operational and ephemeral:

- Agent heartbeat timestamps
- In-progress run state
- Local worktree paths
- Scheduler locks
- Checkout leases

A general issue tracker sync model may accidentally replicate data that should remain node-local.

### Beads Verdict

Do not use Beads as Fusion’s storage backend.

Potential uses:

- Study its local-first task model.
- Build an importer/exporter if useful.
- Reuse similar concepts for task dependency syncing.
- Do not couple Fusion core storage or node sync to it.

## Dolt Evaluation

Dolt is effectively “Git for SQL databases”: relational tables with branches, diffs, commits, remotes, merges, conflicts, and SQL access.

### What Dolt Is Good At

Dolt provides:

- Versioned relational data
- SQL access
- Branch/merge workflow
- Diff/commit history
- Conflict detection
- Remote push/pull semantics
- MySQL-compatible protocol
- Data provenance

This sounds compelling because Fusion already stores structured metadata in SQLite.

### Why Dolt Is Tempting

Fusion needs distributed relational sync. Dolt provides many adjacent primitives:

- Nodes could have branches.
- Sync could be pull/merge/push.
- Conflicts could be represented explicitly.
- Settings/task diffs could be inspected.
- History could be queryable.
- Multi-node sync could use Dolt remotes.

For structured metadata, Dolt is more relevant than Beads.

### Major Tradeoffs

#### Dolt is not an embedded SQLite replacement

Fusion currently uses SQLite through `node:sqlite`.

This is simple:

- No server
- No external daemon
- Small operational footprint
- Works inside a published npm CLI
- Easy local project DB
- WAL mode concurrency
- Files live in `.fusion/fusion.db`

Dolt is operationally different:

- Usually accessed as a Dolt database/server or CLI-managed repo
- MySQL-compatible, not SQLite-compatible
- Requires different drivers and query behavior
- Adds a heavier binary dependency
- Is harder to bundle into `@runfusion/fusion`

For a globally installed npm CLI, this matters.

#### Migration cost is high

Fusion’s persistence layer is deeply SQLite-oriented:

- `packages/core/src/db.ts`
- `TaskStore`
- `CentralCore`
- migrations
- tests using real SQLite
- project-local DB assumptions
- `.fusion/fusion.db` file layout

Switching to Dolt would likely require a storage abstraction layer or a major rewrite.

#### SQL merge is not domain merge

Dolt can tell you there is a data conflict. It does not know what Fusion should do.

Example conflict:

```text
task.status:
Node A: in-progress
Node B: done
```

Dolt can surface a conflict, but Fusion still needs to decide:

- Is `done` allowed if `in-progress` happened elsewhere?
- Was review skipped?
- Which transition wins?
- Should this create a merge-resolution task?
- Should the losing transition be preserved in activity log?

Fusion has domain-level lifecycle rules. SQL merge does not replace those rules.

#### Some tables should not be globally merged

Fusion has mixed data classes:

| Data type | Sync behavior |
|---|---|
| Tasks | Sync |
| Task documents | Sync |
| Settings | Selectively sync |
| Missions/roadmaps | Sync |
| Activity log | Append-only |
| Run audit | Append-only or local-origin |
| Agent heartbeats | Usually local-only or summarized |
| Checkout leases | Local-only or TTL-based |
| Local worktree paths | Local-only |
| Auth secrets | Special encrypted sync only |

A generic database merge risks syncing the wrong things unless carefully partitioned.

#### Filesystem blobs remain unsolved

Fusion stores large task artifacts in `.fusion/tasks/{ID}/`.

Dolt can store data in tables, but putting logs, prompts, attachments, and large blobs into Dolt would be undesirable. Fusion would still need a blob sync protocol.

#### Operational burden

Dolt introduces product questions:

- How is Dolt installed?
- Is it bundled with the npm package?
- What about Windows/macOS/Linux binaries?
- How are DB upgrades handled?
- Does the dashboard start a Dolt SQL server?
- What port does it use?
- How does this work with `fn serve`?
- How does it interact with user Git repos?
- How are backups handled?
- How are conflicts exposed in the dashboard?

That is a large product surface.

### Dolt Verdict

Dolt is technically promising, but should not become Fusion’s primary storage engine now.

Better uses:

1. **Experimental sync backend**
   - Add a prototype adapter for selected tables.
   - Try syncing `tasks`, `activityLog`, and `settingsSyncState`.
   - Measure complexity.
2. **External export format**
   - Export Fusion state into Dolt for audit/history/diff.
   - Do not make runtime depend on it.
3. **Admin/enterprise mode**
   - Potentially useful later for teams wanting SQL history and data provenance.

## Recommended Fusion-Native Sync Design

Keep the current SQLite architecture and add a dedicated sync layer.

### Core Idea

Use **append-only change events** plus **materialized SQLite state**.

Fusion already has adjacent concepts:

- `activityLog`
- `runAuditEvents`
- node registry
- settings sync state
- task lifecycle transitions
- central DB node metadata

Build on those instead of replacing storage.

### Stable Node Identity

Each node should have:

```ts
nodeId
publicKey?
apiKey / auth credentials
lastSeen
syncCursorByPeer
```

This is already partially represented by `nodes` and `peerNodes`.

### Change Log Table

Add a project-level sync log:

```sql
CREATE TABLE sync_events (
  id TEXT PRIMARY KEY,
  originNodeId TEXT NOT NULL,
  seq INTEGER NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  operation TEXT NOT NULL,
  payloadJson TEXT NOT NULL,
  baseRevision TEXT,
  resultingRevision TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
```

This becomes the canonical stream nodes exchange.

### Per-Entity Revision Metadata

For synced tables:

```sql
CREATE TABLE entity_revisions (
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  revision TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  updatedByNodeId TEXT NOT NULL,
  PRIMARY KEY (entityType, entityId)
);
```

Revision options:

- Lamport timestamp
- Hybrid logical clock
- Compact vector clock
- Content hash plus origin sequence

### Conflict Policies by Entity and Field

Do not rely on generic last-write-wins everywhere.

| Entity | Conflict policy |
|---|---|
| Task title/description | Last-write-wins or field-level merge |
| Task status | Lifecycle-aware transition merge |
| Task labels | Set union |
| Task dependencies | Set union with cycle detection |
| Activity log | Append-only |
| Run audit | Append-only |
| Checkout lease | Local-only or TTL conflict |
| Agent heartbeat | Node-local by default |
| Settings | Scoped, field-level, explicit push/pull |
| Auth | Encrypted explicit sync only |
| Attachments | Content-addressed blob transfer |

### Blob Sync

For files under `.fusion/tasks/{ID}/`, use content-addressed metadata:

```sql
CREATE TABLE sync_blobs (
  digest TEXT PRIMARY KEY,
  taskId TEXT,
  relativePath TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimeType TEXT,
  createdAt TEXT NOT NULL
);
```

Then transfer blobs separately:

```text
GET /api/sync/blobs/:digest
PUT /api/sync/blobs/:digest
```

Avoid stuffing large logs and attachments into relational sync.

### Peer Protocol

Potential endpoints:

```text
GET  /api/sync/summary
GET  /api/sync/events?since=<cursor>
POST /api/sync/events
GET  /api/sync/blobs/:digest
POST /api/sync/blobs
POST /api/sync/resolve-conflict
```

### Conflict Visibility

Conflicts should become first-class Fusion objects:

- Shown in the dashboard
- Resolvable by user or agent
- Optionally converted into `FN-*` tasks
- Include both versions and proposed resolution

## Dolt vs Fusion-Native Sync

### Dolt Advantages

- Existing versioned SQL system
- Built-in diff/merge/push/pull
- Strong data history
- Good for auditable relational datasets
- Mature conceptual model

### Dolt Disadvantages for Fusion

- Heavy runtime dependency
- Not SQLite-compatible
- Requires major persistence refactor
- Does not handle Fusion domain conflicts automatically
- Does not solve file/blob sync cleanly
- Harder npm distribution story
- Risky for local CLI UX

### Fusion-Native Advantages

- Keeps current SQLite
- Minimal disruption
- Tailored conflict semantics
- Can sync only the right tables
- Easier dashboard integration
- Easier to bundle and test
- Works with current `.fusion/` layout
- Can evolve incrementally

### Fusion-Native Disadvantages

- More custom code
- Conflict logic must be carefully designed
- Sync cursor correctness is hard
- Requires robust test coverage
- More engineering effort than delegating to an existing system

However, Fusion’s domain is specialized enough that custom sync semantics are likely unavoidable either way.

## Decision

Do not switch to Beads.

Do not replace SQLite with Dolt yet.

Build native sync first.

Recommended phased plan:

1. **Classify all tables**
   - synced
   - append-only
   - local-only
   - encrypted/explicit
   - blob-backed
2. **Add sync event log**
   - append-only
   - origin node
   - sequence/cursor
   - entity revision
3. **Implement task/settings sync first**
   - tasks
   - task documents
   - settings
   - activity log
4. **Add blob sync**
   - content-addressed task files
5. **Add dashboard conflict UI**
   - task conflicts
   - settings conflicts
   - agent-assisted resolution
6. **Prototype Dolt separately**
   - feature flag or branch only
   - measure install size, query compatibility, performance, and conflict ergonomics

Final recommendation:

> Keep SQLite as Fusion’s embedded source of truth. Build a Fusion-native sync layer. Treat Dolt as an optional future backend or audit/export target. Treat Beads as product inspiration, not infrastructure.
