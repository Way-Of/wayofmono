# Way of Work Database Schema Snippets and Best Practices

This document provides common database schema snippets and best practices for developing skills and features within the Way of Work (WoW) platform, focusing on multi-tenancy and standard data types.

## 1. Standard Table Structure (with Multi-Tenancy)

All primary application tables in WoW should include `id`, `tenant_id`, `created_at`, and `updated_at` columns.

```sql
CREATE TABLE IF NOT EXISTS some_table (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

## 2. Common Data Types

- `TEXT`: Used for IDs (UUIDs), names, descriptions, and string-based timestamps (`CURRENT_TIMESTAMP`).
- `INTEGER`: Used for counts, boolean flags (0 or 1).
- `REAL`: Used for floating-point numbers (e.g., prices, coordinates).
- `BLOB`: Used for binary data, though rarely.
- `JSON`: Often stored as `TEXT` and parsed/stringified in application logic.

## 3. Foreign Key Relationships

- Always define `FOREIGN KEY` constraints for relationships between tables.
- Use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate for data integrity.

## 4. Indexing

- Index `tenant_id` on all tables for efficient multi-tenant queries.
- Index frequently queried columns (e.g., `status`, `name`).

```sql
CREATE INDEX IF NOT EXISTS idx_some_table_tenant_id ON some_table(tenant_id);
CREATE INDEX IF NOT EXISTS idx_some_table_name ON some_table(name);
```

## 5. Example: `projects` Table

```sql
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    budget_allocated REAL DEFAULT 0.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```
