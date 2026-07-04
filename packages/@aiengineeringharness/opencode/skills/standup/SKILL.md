---
name: standup
description: Generate daily end-of-day standup entries and save them to the shared f-rr-d thoughts repository at thoughts/global/standup/<dev>/<YYYY-MM-DD>.md. Detects developer identity, prompts for work details, blockers, and metrics, then commits and pushes the entry to f-rr-d.
disable-model-invocation: true
allowed-tools: read, write, bash, glob, grep, git
---
# Daily Standup

Generate a daily end-of-day standup entry and save it to the shared f-rr-d thoughts repository.

## What This Skill Does

1. Detects the developer's identity (git config, $USER, or prompt)
2. Prompts for today's work details
3. Creates a date-stamped standup file at `thoughts/global/standup/<dev>/<YYYY-MM-DD>.md`
4. Commits and pushes the entry to the f-rr-d repo

## Instructions

### Step 1: Detect Developer

Determine the developer's username in order of priority:
1. Check `git config user.name` in the project repo
2. Check `$USER` environment variable
3. If neither resolves to a known developer, prompt: "What is your developer username (e.g., zerwiz, craig, andre, tomas, michael)?"

Known developer usernames: zerwiz, craig, andre, tomas, michael

### Step 2: Prompt for Standup Details

Ask the developer for each of the following. Default answers are in brackets — accept empty input to use the default.

#### What did you work on today?

For each ticket or task:
- Ticket ID (e.g., WOMONO-XXX) or "—" if no ticket
- Brief description
- Status change (e.g., "Backlog → In Progress" or "—")
- Effort in hours (e.g., "3h")

#### What are you planning to work on tomorrow?

For each item:
- Priority (P0/P1/P2)
- Ticket ID or "—"
- Description

#### Any blockers?

For each blocker:
- Ticket ID or "—"
- Description of the blocker
- Unblock ETA (date or "—")
- Who's needed to unblock

#### How was your day?

Ask for metrics. Accept empty input for any field to skip it:
- Hours coded
- Hours in meetings
- Commits pushed
- PRs opened
- PRs reviewed
- Tickets completed

#### Any other notes?

Free-form text. Accept empty input to skip.

### Step 3: Create Standup File

Ensure the directory exists:

```bash
mkdir -p thoughts/global/standup/<dev>/
```

Create the file at `thoughts/global/standup/<dev>/<YYYY-MM-DD>.md` using the template format.

### Step 4: Commit and Push to f-rr-d

```bash
git -C thoughts/ add global/standup/<dev>/<YYYY-MM-DD>.md
git -C thoughts/ commit -m "standup: <dev> <YYYY-MM-DD>"
git -C thoughts/ push origin main
```

If push is rejected (remote has new commits from another machine):
```bash
git -C thoughts/ pull --rebase
git -C thoughts/ push origin main
```

## Standup File Format

Create the file using this exact format (fill in the developer's responses):

```markdown
# Standup — <YYYY-MM-DD> — <Developer Name>

## What I Worked On Today

| Ticket | Description | Status Change | Effort |
|--------|-------------|---------------|--------|
| <ticket> | <description> | <status change> | <effort> |

## What I Plan to Work On Tomorrow

| Priority | Ticket | Description |
|----------|--------|-------------|
| <P0/P1/P2> | <ticket> | <description> |

## Blockers

| Ticket | Blocker | Unblock ETA | Needs |
|--------|---------|-------------|-------|
| <ticket> | <description> | <eta> | <who> |

## Metrics

| Metric | Value |
|--------|-------|
| Hours coded | <n> |
| Hours meetings | <n> |
| Commits pushed | <n> |
| PRs opened | <n> |
| PRs reviewed | <n> |
| Tickets completed | <n> |

## Notes

<free-form notes>
```

If any section has no entries, omit it from the file entirely (do not render an empty table).

## Edge Cases

### thoughts/ Not Cloned

If `thoughts/` does not exist or is not a git repo, error out with:
"f-rr-d thoughts repo not found at thoughts/. Run /init_harness first."

### Push Fails (Auth)

If push fails due to authentication, guide the user:
"GitHub authentication required for f-rr-d. Run `gh auth login` or configure a personal access token, then: git -C thoughts/ push origin main"

### Unknown Developer

If the detected developer username doesn't match any known developer, still create the standup file — the name will be added to the team later. Print a warning: "Unknown developer '<name>'. If this is you, ask to be added to thoughts/global/team.md."
