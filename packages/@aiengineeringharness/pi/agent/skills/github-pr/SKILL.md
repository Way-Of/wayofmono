---
name: github-pr
description: "Create, manage, and review GitHub Pull Requests with ticket linking, template support, and review workflow integration."
allowed-tools: read, write, edit, bash, git, gh
---

# GitHub PR Skill

Manages GitHub Pull Requests with full ticket integration, templates, and review workflow.

## PR Template

```markdown
## Summary
Brief description of changes

## Ticket
Closes: WOMONO-084

## Changes
- [ ] Change 1
- [ ] Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Workflow

### 1. Create PR from Branch

```bash
# Create PR with template, auto-link to ticket
gh pr create --title "WOMONO-084: Add GitHub skills" \
  --body "$(cat .github/PR_TEMPLATE.md)" \
  --base main \
  --head womono/WOMONO-084-github-skills
```

### 2. Request Review

```bash
# Request review from team/CTO
gh pr edit --add-reviewer cto-username
gh pr edit --add-label "needs-review"
```

### 3. Address Review Comments

```bash
# Push fixes to same branch
git add .
git commit -m "fix: address review comments"
git push
```

### 4. Merge

```bash
# After approval, merge with squash
gh pr merge --squash --delete-branch
```

## Available Tools

### `create_pr`
Create PR with template and ticket linking.
Parameters:
- `ticket_id` (required): Ticket ID (e.g., "WOMONO-084")
- `branch_name` (required): Source branch name
- `base_branch` (optional): Target branch (default: "main")
- `title` (optional): PR title (auto-generated from ticket)
- `draft` (optional): Create as draft (default: false)

### `request_review`
Request review from specific users or teams.
Parameters:
- `pr_number` (required): PR number
- `reviewers` (optional): GitHub usernames
- `team_reviewers` (optional): GitHub team slugs

### `add_pr_comment`
Add comment to PR (review, question, approval).
Parameters:
- `pr_number` (required): PR number
- `body` (required): Comment text
- `type` (optional): "review" | "comment" | "approval"

### `update_pr`
Update PR title, body, or base branch.
Parameters:
- `pr_number` (required): PR number
- `title` (optional): New title
- `body` (optional): New body
- `base_branch` (optional): New base branch

### `merge_pr`
Merge PR with options.
Parameters:
- `pr_number` (required): PR number
- `method` (optional): "merge" | "squash" | "rebase" (default: "squash")
- `delete_branch` (optional): Delete branch after merge (default: true)

### `link_pr_to_ticket`
Update ticket with PR URL and status.
Parameters:
- `ticket_id` (required): Ticket ID
- `pr_url` (required): PR URL
- `pr_number` (required): PR number

## Integration

- Auto-links PR to ticket via `ticket-manager` `link_pr_to_ticket`
- Updates ticket status to "Submitted for Review" on PR creation
- CTO Dashboard Review Queue watches for "needs-review" label
- On merge, updates ticket to "Done" and deletes branch