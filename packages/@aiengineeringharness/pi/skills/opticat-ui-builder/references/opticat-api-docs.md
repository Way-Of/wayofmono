# OptiCat API Documentation

This document provides details on the OptiCat REST API endpoints.

## Endpoints

### `/api/opticat/summary`
- **Method**: GET
- **Description**: Retrieves a summary of OptiCat data, including counts for projects, AHUs, pending reports, and warnings.
- **Response**:
```json
{
  "projects": 0,
  "ahu": 0,
  "pending_reports": 0,
  "warnings": 0
}
```

### `/api/opticat/projects`
- **Method**: GET
- **Description**: Lists all OptiCat projects.
- **Response**:
```json
[
  {
    "id": "proj-123",
    "name": "Project Alpha",
    "status": "Active",
    "buildings": 2,
    "ahu_count": 5,
    "last_sync": "2026-06-05T10:00:00Z"
  }
]
```

### `/api/opticat/aggregat`
- **Method**: GET
- **Description**: Retrieves AHU (Aggregat) data.
- **Response**:
```json
[
  {
    "id": "ahu-001",
    "name": "AHU-A-001",
    "status": "Operational",
    "project_id": "proj-123"
  }
]
```

### `/api/opticat/service-reports`
- **Method**: GET
- **Description**: Lists service reports.
- **Response**:
```json
[
  {
    "id": "report-001",
    "title": "Annual Maintenance",
    "status": "Completed",
    "project_id": "proj-123",
    "report_date": "2026-05-20"
  }
]
```

### `/api/opticat/sync-log`
- **Method**: GET
- **Description**: Retrieves synchronization logs.
- **Response**:
```json
[
  {
    "id": "sync-001",
    "timestamp": "2026-06-05T10:00:00Z",
    "status": "Success",
    "details": "Full sync complete"
  }
]
```
