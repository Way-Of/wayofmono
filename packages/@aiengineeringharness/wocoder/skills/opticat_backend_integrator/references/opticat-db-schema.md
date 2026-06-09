# OptiCat Database Schema

This document outlines the database schema for the OptiCat platform, including table structures, relationships, and data types.

## Tables

### `opticat_projects`
- **Description**: Stores information about HVAC projects.
- **Columns**:
    - `id` (TEXT, PRIMARY KEY): Unique identifier for the project.
    - `name` (TEXT): Name of the project.
    - `status` (TEXT): Current status of the project (e.g., "active", "completed").
    - `buildings` (INTEGER): Number of buildings associated with the project.
    - `ahu_count` (INTEGER): Number of AHUs in the project.
    - `last_sync` (TEXT): Timestamp of the last synchronization with an external system.
    - `tenant_id` (TEXT): Foreign key to the tenant.

### `opticat_aggregat`
- **Description**: Stores data for Air Handling Units (AHUs).
- **Columns**:
    - `id` (TEXT, PRIMARY KEY): Unique identifier for the AHU.
    - `project_id` (TEXT, FOREIGN KEY): References `opticat_projects.id`.
    - `name` (TEXT): Name/identifier of the AHU.
    - `status` (TEXT): Operational status (e.g., "operational", "maintenance").
    - `location` (TEXT): Physical location of the AHU.
    - `last_maintenance_date` (TEXT): Date of the last maintenance.
    - `tenant_id` (TEXT): Foreign key to the tenant.

### `opticat_service_reports`
- **Description**: Stores service and OVK reports for AHUs or projects.
- **Columns**:
    - `id` (TEXT, PRIMARY KEY): Unique identifier for the report.
    - `project_id` (TEXT, FOREIGN KEY): References `opticat_projects.id`.
    - `ahu_id` (TEXT, FOREIGN KEY, NULLABLE): References `opticat_aggregat.id`.
    - `title` (TEXT): Title of the report.
    - `description` (TEXT): Detailed description of the service performed or findings.
    - `status` (TEXT): Status of the report (e.g., "completed", "pending review").
    - `report_date` (TEXT): Date the report was generated.
    - `technician_id` (TEXT): Identifier of the technician who performed the service.
    - `tenant_id` (TEXT): Foreign key to the tenant.

### `opticat_sync_log`
- **Description**: Logs synchronization events with external OptiCat systems.
- **Columns**:
    - `id` (TEXT, PRIMARY KEY): Unique identifier for the log entry.
    - `timestamp` (TEXT): Time of the synchronization event.
    - `status` (TEXT): Result of the sync (e.g., "success", "failure").
    - `details` (TEXT): Detailed message about the sync operation.
    - `tenant_id` (TEXT): Foreign key to the tenant.

## Relationships

- `opticat_aggregat.project_id` -> `opticat_projects.id`
- `opticat_service_reports.project_id` -> `opticat_projects.id`
- `opticat_service_reports.ahu_id` -> `opticat_aggregat.id`

(This schema is based on previous interactions and the `plugin/opticat` structure.)
