# GitHub Integration Configuration

## Repository Details

**Repository**: `https://github.com/Way-Of/wayofmono`

**URL**: `https://github.com/Way-Of/wayofmono`

**Type**: Main Way of Mono project repository

**Branch Structure**:
- `main` - Production (protected, requires PR & review)
- `staging` - Pre-production (protected, requires PR & review)
- `feature/*` - Feature branches (auto-created via tickets)
- `develop` - Integration branch (protected)

---

## Integration Points

### 1. GitHub Issues ↔ OpTicAT Tickets

Create bidirectional sync between GitHub issues and OpTicAT ticket system.

#### Mapping Logic

| GitHub Concept | OpTicAT Equivalent |
|----------------|--------------------|
| Issue Title | Ticket title |
| Issue Description | Ticket description + OpTicAT notes |
| Labels | Ticket tags/categorization |
| Milestones | Workflow stages |
| Comments | Comment history |
| Assignees | Ticket assignee |

#### Status Mapping

```yaml
GitHub Milestone: Backlog
  → OpTicAT Priority: low | Status: backlog

GitHub Milestone: In Progress
  → OpTicAT Priority: medium | Status: in_progress

GitHub Milestone: Code Review
  → OpTicAT Priority: high | Status: review | Workflow: qa

GitHub Milestone: Ready for Deploy
  → OpTicAT Priority: critical | Status: approved | Workflow: deployment

GitHub Issue: closed
  → OpTicAT Status: archived
```

### 2. Repository Webhooks

Configure these webhooks in GitHub Settings → Settings → Hooks |

```json
{
  "event": "issues",
  "content_type": "json",
  "secret": "your_webhook_secret",
  "active": true,
  "include_tags": false
}
```

| Event | Payload Key | Action |
|-------|-------------|-- |------|
| `issues` | `issue.*` | Create/update ticket |
| `issue_comment` | `comment.body` | Update ticket comments |
| `label` | `label.name` | Update ticket tags |
| `milestone` | `milestone.state` | Update workflow stage |

### 3. Branch Protection Rules

#### `main` Branch Protection

```yaml
protected: true
required_approvals: 1
required_status_checks: strict
require_status_passing: true
allowed_merge_methods: ["squash"]
delete_branch_on_merge: true
```

#### `staging` Branch Protection

```yaml
protected: true
required_approvals: 1
required_status_checks: strict
require_status_passing: true
allowed_merge_methods: ["squash", "rebase"]
delete_branch_on_merge: false
```

### 4. Pull Request Templates

#### Template Structure

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

Fixes/Related to: TCKT-XXXX

## Changes

- Brief description of changes

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual QA verified

## Screenshots (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-requested code review
- [ ] Documentation updated

## Related Issues/Closed Tickets

- Closes #XXXX
```

---

## Workflow Automation

### Automated Workflows

#### 1. Issue Creation → Ticket Creation

```yaml
- name: Create ticket from GitHub issue
  triggers:
    - issues.create
  actions:
    - OpTicAT API: create
      ticket_id: github-issue-number
      repository: wayofmono
      title: {{ github.event.issue.title }}
      description: {{ github.event.issue.body }}
      type: development
      priority: {{ github.event.issue.labels.name }}
```

#### 2. Ticket Status Updates

```yaml
- name: Update ticket status
  triggers:
    - issues.status_change
    - label.create
    - label.delete
  actions:
    - OpTicAT API: update
      ticket_id: {{ github.issue.number }}
      status: {{ mapped_label_value }}
      labels: {{ github.event.issue.labels }}
```

### CI/CD Integration

#### GitHub Actions Workflow

Create `.github/workflows/issue_sync.yml`:

```yaml
name: Issue-to-Ticket Sync

on:
  issues:
    types: [opened, edited, closed]
  pull_request_target:
    types: [review_requested, review_dismissed]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync issue to OpTicAT
        run: |
          # Sync logic here
          # Call OpTicAT API
          ./scripts/sync-issue-to-ticket.sh
```

---

## Access Control

### GitHub Teams → OpTicAT Roles

| GitHub Team | OpTicAT Role | Description |
|-------------|-------------|-------------|
| `team/developers` | developer | Can create/view/edit tickets |
| `team/design` | designer | Can create/view design tickets |
| `team/qe` | qa_eng | Can view all, create test tickets |
| `team/ops` | ops | Admin access to all systems |

### Repository Permissions

| Team | `Push` | `Pull` | `Admin` | Comments |
|------|--|--|-----|-- |------|
| developers | ✅ | ✅ | ❌ | Can comment on their tickets |
| designers | ✅ | ✅ | ❌ | Design tickets only |
| qa | ✅ | ✅ | ❌ | Read/write test tickets |
| ops | ✅ | ✅ | ✅ | Full access |
| viewers | ❌ | ✅ | ❌ | Read-only access |

---

## Event Handlers

### Ticket Creation Event

Triggered when: New issue created on GitHub

```javascript
// Event handler logic
async function handleIssueCreated(event) {
  const issue = event.payload.issue;
  
  const ticket = await createTicket({
    id: `TCKT-${issue.number.toString().padStart(3, '0')}`,
    title: issue.title,
    description: issue.body,
    type: determineType(issue.labels),
    priority: determinePriority(issue.labels),
    status: 'open',
    github_repo: 'Way-Of/wayofmono',
    github_issue_id: issue.number
  });
  
  return ticket;
}
```

### Status Change Event

Triggered when: Issue status or labels change

```javascript
// Event handler logic
async function handleStatusChanged(event) {
  const issue = event.payload.issue;
  
  await updateTicket({
    id: issue.number.toString(),
    status: mapStatus(issue.labels),
    labels: issue.labels.map(l => l.name),
    priority: determinePriority(issue.labels)
  });
}
```

---

## API Endpoints

### OpTicAT API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tickets` | List all tickets |
| `GET` | `/api/v1/tickets/:id` | Get ticket by ID |
| `POST` | `/api/v1/tickets` | Create new ticket |
| `PUT` | `/api/v1/tickets/:id` | Update ticket |
| `DELETE` | `/api/v1/tickets/:id` | Soft delete ticket |

### Example API Call

```bash
# Create ticket
curl -X POST https://opticat.example.com/api/v1/tickets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add OAuth2 support",
    "type": "development",
    "priority": "high",
    "assigned_to": "developer123"
  }'
```

---

## Monitoring

### Health Checks

```bash
# Check ticket sync status
curl -X GET https://opticat.example.com/api/v1/health/sync

# Get sync statistics
curl -X GET https://opticat.example.com/api/v1/health/stats

# List recent sync events
curl -X GET https://opticat.example.com/api/v1/tickets/sync-events
```

### Alerts Configuration

| Alert | Threshold | Action |
|-------|-----------|--------|
| `sync_failure` | 3 consecutive failures | Notify ops team |
| `stale_tickets` | Tickets >30 days without update | Create backlog tickets |
| `webhook_offline` | GitHub webhook timeout | Retry + alert |
| `sync_latency` | Sync >2 minutes | Investigate bottleneck |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Tickets not syncing | Webhook inactive | Reactivate webhook |
| Duplicate tickets | Event fired twice | Implement dedup logic |
| Status not updating | Wrong label mapping | Check label mapping table |
| API rate limit | Too many requests | Implement retry-with-backoff |

### Debug Mode

```bash
# Enable verbose logging
export OPTICAT_DEBUG=true

# Test webhook manually
curl -X POST https://github.com/hooks/github \
  -H "X-GitHub-Event: issues" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d @request.json
```

---

## Security

### Authentication

- **Method**: OAuth2 / API Tokens
- **Rotation**: Every 90 days automatically
- **Storage**: Environment variables + Secrets Manager

### Secret Management

```bash
# GitHub webhook secret
GITHUB_WEBHOOK_SECRET="your-secret-key"

# OpTicAT API token
OPTICAT_API_KEY="your-api-key"
```

### Audit Logging

All ticket/issue operations logged:

```json
{
  "timestamp": "ISO8601",
  "action": "create|update|delete|sync",
  "user": {
    "username": "...",
    "email": "..."
  },
  "source": "github|opticat|api|workflow",
  "ticket_id": "TCKT-XXX"
}
```

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-08 | Initial GitHub integration docs |

---

## Related Documents

- [Migration Guide](./MIGRATION-INTEGRATION-GUIDE.md)
- [Migration Ticket](./TCKT-MIGRATION-001.md)
- [GitHub Repository](https://github.com/Way-Of/wayofmono)
