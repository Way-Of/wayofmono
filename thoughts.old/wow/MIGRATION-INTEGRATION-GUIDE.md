# Migration & Integration Architecture Guide

## Overview

This document provides a comprehensive architecture for migrating from legacy file-based ticket management to an OpTicAT-backed system with GitHub integration.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    OpTicAT Data Platform                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │  Ticket DB   │  │  Skills DB   │  │  User Management │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              GitHub Integration Layer                    │    │
│  │  • Webhooks for event triggers                           │    │
│  │  • Issue sync APIs                                       │    │
│  │  • Repository hooks: wayofmono GitHub                   │    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                  Legacy Migration Source                        │
│                                                                  │
│  /home/zerwiz/CodeP/wayofwork/                                  │
│  └── thoughts/                                                   │
│      └── shared/                                                 │
│          └── tickets/                                            │
│              ├── oldtickets/          ← Archive (read-only)     │
│              └── active/              ← Active tickets (new)    │
└────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Complete Layout

```bash
/home/zerwiz/CodeP/wayofwork/
├── thoughts/
│   └── shared/
│       ├── tickets/                          # Active ticket system
│       │   ├── development/                  # Dev tickets
│       │   ├── design/                       # Design tickets
│       │   ├── testing/                      # QA tickets
│       │   ├── documentation/                # Content tickets
│       │   ├── devops/                       # Infrastructure
│       │   └── skills/                       # Training/skills
│       ├── oldtickets/                       # Legacy archive
│       │   ├── GITHUB_USAGE_BEST_PRACTICES.md
│       │   ├── MIGRATION_TICKETS_GUIDE.md
│       │   └── [other legacy files]
│       └── archive/                          # Additional archival
│           └── oldtickets/
│               └── [historical backups]
├── docs/                                     # Technical documentation
└── scripts/                                  # Migration scripts
    ├── migrate-tickets.sh
    ├── backup-archive.sh
    └── sync-issues.sh
```

---

## Database Schema

### Ticket Collection (OpTicAT)

```json
{
  "_id": "string",
  "ticket_id": "TCKT-XXXX",
  "title": "string",
  "description": "string",
  "type": "development|design|testing|documentation|devops|skills",
  "priority": "low|medium|high|critical",
  "status": "open|in_progress|review|done|archived",
  "assigned_to": "string",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "github_repo": "Way-Of/wayofmono",
  "github_issue_id": "number|null",
  "tags": ["string"],
  "attachments": ["string"],
  "workflow_stage": "planning|development|qa|deployment"
}
```

### Skill Collection

```json
{
  "_id": "string",
  "skill_name": "string",
  "category": "git|github|testing|devops|design|general",
  "difficulty": "beginner|intermediate|advanced",
  "description": "string",
  "related_tickets": ["string"],
  "resources": ["string"],
  "status": "active|deprecated"
}
```

---

## GitHub Integration Flow

### Sync Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  GitHub Webhooks → OpTicAT Incoming Event Queue              │
│     ├── repo:created → ticket.status = "open"                │
│     ├── issue:edited → ticket.description = event.body       │
│     ├── issue:closed → ticket.status = "archived"            │
│     └── label:changed → update ticket tags                    │
└──────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  OpTicAT Processing Engine                                    │
│     ├── Validate event data                                    │
│     ├── Check data integrity                                    │
│     ├── Update local database                                   │
│     └── Push changes back to GitHub                            │
└──────────────────────────────────────────────────────────────┘
```

### Webhook Events

| Event | Trigger | Action |
|-------|---------|--------|
| `issues.created` | New issue | Create ticket in OpTicAT |
| `issues.edited` | Title/desc change | Update ticket fields |
| `issues.deleted` | Issue removal | Archive ticket |
| `issues.labeled` | Label changes | Update ticket tags |

### GitHub Labels Mapping

| GitHub Label | OpTicAT Status |
|-------------|---------------|
| `status:backlog` | `priority:low, status:open` |
| `status:work-in-progress` | `status:in_progress` |
| `status:code-review` | `status:review` |
| `status:merged` | `status:archived` |
| `type:bug` | `type:development` |
| `type:feature` | `type:development` |
| `type:enhancement` | `type:development` |
| `team:dev` | `category:development` |
| `team:design` | `category:design` |
| `team:test` | `category:testing` |

---

## Migration Process

### Step 1: Audit Existing Tickets

```bash
# List all existing tickets
find /home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets/oldtickets -name "*.md" \
  -type f | sort

# Export ticket metadata
for file in $(find . -name "*.md" -type f); do
  echo "Processing: $file"
  # Extract metadata
done
```

### Step 2: Create Migration Mapping

| Field (Legacy) | Field (OpTicAT) | Mapping Logic |
|----------------|-----------------|---------------|
| Ticket Title | `title` | Direct mapping |
| Priority | `priority` | `High` → `high`, `Medium` → `medium` |
| Created Date | `created_at` | ISODate conversion |
| Description | `description` | Direct mapping |

### Step 3: Execute Migration

```bash
# Create migration script
cat > migrate-tickets.sh << 'EOF'
#!/bin/bash
MIGRATION_SOURCE="/home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets/oldtickets"
MIGRATION_TARGET="/home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets/active"

# Process each ticket
for ticket in $MIGRATION_SOURCE/*.md; do
  # Extract metadata
  # Transform data
  # Insert into OpTicAT
done
EOF
```

### Step 4: Validate Migration

```bash
# Verify ticket count
echo "Source tickets: $(find $MIGRATION_SOURCE -name "*.md" | wc -l)"
echo "Migrated tickets: $(find $MIGRATION_TARGET -name "*.md" | wc -l)"

# Compare IDs and metadata
# Test read/write operations
```

---

## Monitoring & Alerts

### Alert Configuration

```yaml
monitoring:
  - name: ticket_sync_monitor
    check: github_webhook_status
    alert: webhook_failure
    threshold: 3
    notification: [slack, email]
  
  - name: backup_monitor
    check: data_integrity
    alert: backup_failure
    schedule: daily
  
  - name: stale_tickets
    check: no_update_for days > 30
    alert: stale_ticket
```

### Dashboard Metrics

- **Ticket Count**: Total tickets in system
- **Open vs. Closed**: Status distribution
- **Sync Latency**: Time from GitHub event to OpTicAT update
- **Migration Progress**: Percentage complete

---

## Security & Access Control

### Permission Matrix

| Role | OpTicAT Access | GitHub Access | Comments |
|------|---------------|----------------|----------|
| **Admin** | Full CRUD | Full repo access | System administrators |
| **Developer** | View + create own tickets | Push to main, create MR | Cannot merge to main |
| **QA Engineer** | View all tickets | Read-only | Can comment on issues |
| **Viewer** | Read-only | Read-only | Cannot create/edit |

### Data Encryption

- **At Rest**: AES-256 encryption for database
- **In Transit**: TLS 1.3 for all API communications
- **Sensitive Fields**: Encrypted PII and credentials

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily automated backup
find /home/zerwiz/CodeP/wayofwork/thoughts/shared/tickets -name "*.md" \
  -exec zip -r tickets-backup-{{date}}.zip {} \;
  
# Copy to secondary storage
rsync -av tickets-backup-{{date}}.zip backup://storage/
```

### Disaster Recovery

| Scenario | Recovery Time | Action |
|----------|--------------|--------|
| Database corruption | 1 hour | Restore from backup |
| Sync failure | 15 minutes | Rebuild sync queue |
| Data loss | 4 hours | Full system restore |

---

## Next Steps

1. **[Week 1]** Setup OpTicAT infrastructure
2. **[Week 2]** Build migration scripts
3. **[Week 3]** Execute migration with validation
4. **[Week 4]** Configure GitHub integration
5. **[Ongoing]** Monitor, optimize, and expand

---

## Related Documentation

- [Migration Ticket](./TCKT-MIGRATION-001.md)
- [GitHub Integration Config](./GITHUB-INTEGRATION.md)
- [OpTicAT Setup Guide](./OPTICAT-SETUP.md)
- [Way of Mono Documentation](https://github.com/Way-Of/wayofmono)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-08 | Migration Team | Initial architecture document |
