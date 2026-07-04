---
name: github-issue
description: "Create, manage, and link GitHub Issues with tickets. Supports bi-directional sync between f-rr-d tickets and GitHub Issues."
allowed-tools: read, write, edit, bash, git, gh
---

# GitHub Issue skill

Manages GitHub Issues with bi-directional sync to f-rr-d tickets.

## Issue Template

```markdown
## Description
Brief description of the issue

## Related Ticket
WOMONO-084

## Type
- [ ] Bug
- [ ] Feature Request
- [ ] Documentation
- [ ] Refactor
- [ ] Infrastructure

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Additional Context
Any other information, screenshots, or references
```

## Workflow

### 1. Create Issue from Ticket

```bash
# Create GitHub Issue linked to ticket
gh issue create \
  --title "WOMONO-084: Add GitHub skills" \
  --body "$(cat .github/ISSUE_TEMPLATE.md)" \
  --label "womono,feature,needs-triage" \
  --assignee "username"
```

### 2. Link Existing Issue to Ticket

```bash
# Add ticket reference to issue
gh issue edit 123 --add-label "womono" --body "$(cat issue-body.md)\n\nTicket: WOMONO-084"

# Update ticket with issue URL
update_ticket --ticket_id WOMONO-084 --github_issue "https://github.com/Way-Of/wayofmono/issues/123"
```

### 3. Sync Issue Status to Ticket

```bash
# When issue is closed, update ticket
gh issue close 123 --comment "Fixed in PR #456"

# Auto-sync via webhook or manual
update_ticket --ticket_id WOMONO-084 --status "Done"
```

## Available Tools

### `create_issue_from_ticket`
Create GitHub Issue from ticket.
Parameters:
- `ticket_id` (required): Ticket ID
- `labels` (optional): Array of labels
- `assignees` (optional): Array of GitHub usernames
- `milestone` (optional): Milestone number

### `link_issue_to_ticket`
Link existing GitHub Issue to ticket.
Parameters:
- `ticket_id` (required): Ticket ID
- `issue_number` (required): GitHub Issue number
- `sync_status` (optional): Sync status changes (default: true)

### `update_issue`
Update GitHub Issue.
Parameters:
- `issue_number` (required): Issue number
- `title` (optional): New title
- `body` (optional): New body
- `labels` (optional): Add/replace labels
- `assignees` (optional): Add/replace assignees
- `state` (optional): "open" | "closed"

### `sync_issue_to_ticket`
Sync GitHub Issue status to ticket.
Parameters:
- `ticket_id` (required): Ticket ID
- `issue_number` (required): Issue number

### `close_issue`
Close GitHub Issue with comment.
Parameters:
- `issue_number` (required): Issue number
- `comment` (optional): Closing comment
- `reason` (optional): "completed" | "not-planned" (default: "completed")

### `list_ticket_issues`
List GitHub Issues linked to ticket.
Parameters:
- `ticket_id` (required): Ticket ID

## Multi-Machine Awareness

- **Issues are GitHub-native**: No local state — create, update, and close from any machine
- **Bi-directional sync is automatic**: Ticket ↔ Issue links work regardless of which machine created them
- **Labels are global**: Shared across all machines via GitHub
- **f-rr-d tickets are the local concern**: Remember to `git -C thoughts/ pull --ff-only` before linking a GitHub Issue to a local ticket

## Integration

- Bi-directional sync: ticket ↔ GitHub Issue
- Issue labels map to ticket metadata (priority, type, project)
- Webhook support for auto-sync (if configured)
- CTO Dashboard shows linked issues
- `ticket-manager` `update_ticket` syncs `github_issue` field

