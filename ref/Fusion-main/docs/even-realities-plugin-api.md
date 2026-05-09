# Even Realities Plugin API

## Test Coverage

| Endpoint | Contract Row | Test Suite | Assertion Type |
| --- | --- | --- | --- |
| `GET /api/plugins/fusion-plugin-even-realities-glasses/board` | Auth required when daemon token enabled | `auth.test.ts` | `it.each` matrix for valid bearer / missing / wrong / `?fn_token=` fallback |
| `GET /api/plugins/fusion-plugin-even-realities-glasses/board` | Board response includes expected columns/task summaries | `integration.test.ts` | Integration response contract assertion |
| `GET /api/plugins/fusion-plugin-even-realities-glasses/tasks/:id` | Optional `summary` capped at 200 chars | `integration.test.ts` | Integration field-boundary assertion |
| `GET /api/plugins/fusion-plugin-even-realities-glasses/changes` | Polling contract: strict `updatedAt > since`, ASC ordering, default/capped limits, `hasMore`, monotonic `serverTime` | `polling.test.ts` | Cursor + pagination contract assertions |
| `GET /api/plugins/fusion-plugin-even-realities-glasses/changes` | Empty diff response shape `{ changes, hasMore, serverTime }` | `polling.test.ts` | Empty-state response assertion |
| `POST /api/plugins/fusion-plugin-even-realities-glasses/quick-capture` | Input validation (required title, title cap) and default column behavior | `quick-capture.test.ts` | Validation + creation side-effect assertions |
| `POST /api/plugins/fusion-plugin-even-realities-glasses/quick-capture` | Task-summary-only response (no description/prompt/log leakage), payload bounded | `response-shape.test.ts`, `quick-capture.test.ts` | Whitelist + payload-size assertions |
| `POST /api/plugins/fusion-plugin-even-realities-glasses/actions/start-work` | Action enabled/disabled by `enableAgentActions` | `agent-actions.test.ts` | Feature-gate integration assertions |
| `POST /api/plugins/fusion-plugin-even-realities-glasses/actions/request-review` | Action enabled/disabled by `enableAgentActions` | `agent-actions.test.ts` | Feature-gate integration assertions |
| `POST /api/plugins/fusion-plugin-even-realities-glasses/actions/*` | Unknown task id rejected | `agent-actions.test.ts` | 404 contract assertion |
| `/api/plugins/fusion-plugin-even-realities-glasses/<plugin-route>` and `/api/plugins/fusion-plugin-even-realities-glasses/enable` | Plugin route mount + management-route collision safety | `packages/dashboard/src/__tests__/plugin-routes-wiring.test.ts` | Routing/wiring integration assertions |
