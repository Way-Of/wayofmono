---
Ticket Number: 011
Title: Sync OptiCat Data to Way of Work REST API
State: Draft
Type: Feature
Priority: High
Labels: [integration, api, wayofwork, opticat, sync]
Assignees: []
Reviewers: []
---

# Sync OptiCat Data to Way of Work REST API

## 1. Problem

OptiCat (HVAC Service Pro) operates as a standalone Flutter app with its own SQLite database. Way of Work (WoW) now exposes a full REST API bridge at `/api/opticat/*` for HVAC data, but OptiCat has no code that pushes data to or pulls data from these endpoints. The integration is server-side only — the DbC (Database connectivity) layer is missing on the OptiCat side.

This means:
- WoW OptiCat tables (`opticat_projects`, `opticat_buildings`, `opticat_aggregat`, `opticat_service_reports`) remain empty until OptiCat pushes data.
- AI agents in WoW (kanban, docs, projektledare) query stubs instead of real HVAC data.
- Field technicians using OptiCat cannot see their data reflected in WoW dashboards.
- Project managers in WoW cannot see HVAC project status.

## 2. Proposed Solution

Build a **DbC client** inside OptiCat that synchronizes data with WoW's REST API. The client should:

1. **Authenticate** with WoW using tenant API credentials (API key or JWT).
2. **Push local changes** to WoW when projects, buildings, aggregats, or service reports are created/updated in OptiCat.
3. **Accept webhooks** from WoW for status updates and approvals.
4. **Handle offline scenarios** — queue pushes when WoW is unreachable, retry on reconnect.

## 3. WoW REST API Reference

All endpoints are prefixed with `/api/opticat/` and require authentication via the WoW session (JWT). In dev mode (`WOP_DEV_MODE=true`), authentication is bypassed.

### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/projects` | List all HVAC projects with aggregat count |
| `GET` | `/api/opticat/projects/:id` | Get single project details |
| `POST` | `/api/opticat/projects` | Create new project |
| `PUT` | `/api/opticat/projects/:id` | Update project (status, name, wo_project_id) |
| `DELETE` | `/api/opticat/projects/:id` | Delete project |

**POST/PUT body:**
```json
{
  "name": "Kraftvärmeverket Nyköping",
  "wo_project_id": "proj_abc123",
  "opticat_project_id": "opti-uuid",
  "building_count": 3,
  "aggregat_count": 7,
  "status": "active"
}
```

### Buildings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/projects/:projectId/buildings` | List buildings for a project |
| `GET` | `/api/opticat/buildings` | List all buildings across projects |
| `GET` | `/api/opticat/buildings/:id` | Get single building |
| `POST` | `/api/opticat/buildings` | Create new building |

**POST body:**
```json
{
  "opticat_project_id": "ocproj_xxx",
  "name": "Huvudbyggnad A",
  "address": "Industrivägen 12, Nyköping",
  "floor_count": 4
}
```

### Aggregat (AHU)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/aggregat` | List all AHUs |
| `GET` | `/api/opticat/aggregat/:id` | Get single AHU with reports |
| `GET` | `/api/opticat/projects/:projectId/aggregat` | List AHUs for a project |
| `POST` | `/api/opticat/aggregat` | Create new AHU |
| `GET` | `/api/opticat/aggregat/:id/components` | List components for an AHU |
| `GET` | `/api/opticat/aggregat/:id/canvas` | Get duct design canvas layout |

**POST body:**
```json
{
  "opticat_project_id": "ocproj_xxx",
  "name": "LB-01",
  "type": "luftbehandlingsaggregat",
  "manufacturer": "Swegon",
  "model": "GOLD RX 120",
  "serial_number": "SWE-2024-0042",
  "status": "drift"
}
```

### Service Reports

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/reports` | List all service/OVK reports |
| `GET` | `/api/opticat/reports/:id` | Get single report |
| `POST` | `/api/opticat/reports` | Create new report |
| `GET` | `/api/opticat/reports/:id/pdf` | Get PDF metadata for a report |

**POST body:**
```json
{
  "opticat_aggregat_id": "ocagg_xxx",
  "report_type": "service",
  "status": "completed",
  "technician_name": "Martin Eriksson",
  "findings": "Filter F7, byte rekommenderas — tryckfall 180 Pa",
  "recommendations": "Byt filterkassett F7 inom 2 veckor",
  "report_date": "2026-06-05"
}
```

### Articles & Cart

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/articles?query=` | Search supplier article catalog |
| `GET` | `/api/opticat/cart` | Get current cart with pending orders |

### Webhook (WoW → OptiCat)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/opticat/webhooks/project-update` | Receive project status changes |

**POST body (WoW sends):**
```json
{
  "event": "project_status_changed",
  "entity_type": "project",
  "entity_id": "ocproj_xxx",
  "message": "Project status changed to completed"
}
```

### Dashboard Summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/summary` | Get aggregate counts (projects, buildings, aggregat, pending reports, warnings) |

### Sync Log

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/opticat/sync-log` | Get last 50 sync log entries |

## 4. Data Model Mapping

| OptiCat (Flutter/Dart) | WoW Table (SQLite) | Sync Direction |
|------------------------|-------------------|----------------|
| `ProjectData` | `opticat_projects` | Push (OptiCat → WoW) |
| `BuildingData` | `opticat_buildings` | Push (OptiCat → WoW) |
| `AggregatCanvasComponent` | `opticat_aggregat` | Push (OptiCat → WoW) |
| `ServiceReport` | `opticat_service_reports` | Push (OptiCat → WoW) |
| `Article` | (stub — no DB table) | Pull (WoW → OptiCat query) |
| `CartItem` | (stub — no DB table) | Pull (WoW → OptiCat query) |
| `InventoryItem` | `opticat_aggregat.component_summary` (JSON) | Push (OptiCat → WoW) |
| Duct layout | `opticat_aggregat/:id/canvas` (JSON) | Push (OptiCat → WoW) |

## 5. Sync Strategy

### Initial Sync (Bulk)
- On first connection, OptiCat pushes all existing projects, buildings, aggregats, and reports to WoW.
- WoW creates records with the provided `opticat_project_id` as the primary identifier.
- OptiCat stores the WoW `id` (e.g., `ocproj_xxx`) for future updates.

### Incremental Sync (Real-time)
- OptiCat intercepts local create/update operations on key models.
- After each local write, OptiCat calls the corresponding WoW `POST` or `PUT` endpoint.
- If WoW is unreachable, the operation is queued locally and retried with exponential backoff.

### Pull (WoW → OptiCat)
- OptiCat periodically polls `/api/opticat/projects/:id` for status changes.
- WoW notifies OptiCat via the webhook endpoint for urgent status changes.
- OptiCat processes webhook payloads and updates local records.

## 6. Acceptance Criteria

- [ ] OptiCat can authenticate with WoW using tenant API credentials
- [ ] A new project created in OptiCat appears in WoW's `/api/opticat/projects` within 5 seconds (online)
- [ ] A new building created in OptiCat appears in WoW's `/api/opticat/projects/:id/buildings`
- [ ] A service report completed offline in OptiCat is queued and pushed to WoW when connectivity resumes
- [ ] WoW webhook `POST /api/opticat/webhooks/project-update` triggers a local update in OptiCat
- [ ] Duct canvas layout from OptiCat is accessible via WoW's `GET /api/opticat/aggregat/:id/canvas`
- [ ] Sync failures are logged in OptiCat with retry status

## 7. Technical Details

### Implementation Locations (OptiCat Side)

```
plugin/opticat/lib/services/
├── wow_api_client.dart         # HTTP client wrapping WoW REST endpoints
├── wow_sync_engine.dart        # Orchestrates push/pull/retry logic
├── wow_sync_queue.dart         # Offline queue with SQLite persistence
├── wow_webhook_handler.dart    # Processes incoming WoW webhooks
└── wow_auth.dart               # JWT/API key management

plugin/opticat/lib/models/
└── wow_sync_status.dart        # Enum: synced, pending, failed
```

### Auth Flow
1. OptiCat requests an API token from WoW via admin UI.
2. Token is stored in OptiCat's encrypted local storage.
3. Every REST call includes `Authorization: Bearer <token>` header.
4. WoW validates the token and enforces tenant isolation.

### Offline Queue
- `wow_sync_queue` stores pending mutations as JSON rows in a local `wow_sync_queue` table.
- Fields: `id`, `endpoint`, `method`, `body`, `created_at`, `retry_count`, `last_error`.
- On connectivity恢复, queue is processed FIFO.
- Failed items after 5 retries are flagged for manual review.

## 8. Dependencies

- WoW server running with `registerOpticatRoutes()` active (already done).
- Dev auth bypass in development (`WOP_DEV_MODE=true`).
- `http` package in OptiCat's `pubspec.yaml`.
- `connectivity_plus` for network state detection.

## 9. Future Considerations

- Real-time sync via WoW WebSocket instead of polling.
- Bidirectional conflict resolution (both sides edit the same record).
- Syncing component inventory and duct canvas as structured data (currently JSON blobs).
- Flutter background sync service for iOS/Android.
