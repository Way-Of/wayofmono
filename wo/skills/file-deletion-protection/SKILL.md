---
name: file-deletion-protection
description: File deletion protection service that prevents accidental data loss by validating user intent and creating undo backups before removing files or folders from the workspace.
license: MIT
metadata:
  buddybot:
    emoji: 🛡️
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(file-deletion-protection:*)
---

# File Deletion Protection

## Setup

```bash
cd ~/.pi/agent/skills/file-deletion-protection && npm install
```

## Usage

```bash
# Safe deletion with confirmation
file-deletion-protection delete "path/file" --confirm

# Create backup before deletion
file-deletion-protection backup "path"

# Undo an accidental deletion
file-deletion-protection restore "backup_path"
```

## Features

- Validates user intent before deletion
- Creates undo backups automatically
- Prevents accidental data loss
- Workspace safety features

## Workflow

1. Request deletion with context
2. System validates intent
3. Backup is created if needed
4. Safe delete proceeds

## Notes

- Works with files and directories
- Maintains deletion log
- Restores within limits
