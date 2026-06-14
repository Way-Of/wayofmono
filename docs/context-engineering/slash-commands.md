# Slash Commands

Built-in commands available across all 7 AI coding tools.

## Workflow Pattern

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

## Command Reference

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (project memory + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/validate_telemetry` | Validate local telemetry against narrative spec |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/sync skills` | Sync all skills to all frontends |
| `/help` | Unified help system |

## Detailed Usage

### /init_harness

Initialize the AI Engineering Harness in a repository:

```bash
/init_harness
```

- Runs tool's project memory init
- Clones shared f-rr-d thoughts repo
- Sets up standard directory structure
- Creates `.wo/config/harness.json`

### /create_plan

Generate detailed implementation plan from ticket:

```bash
/create_plan WOMONO-123
```

- Interactive, iterative process
- Leverages Gemini CLI tools for research
- Creates plan in `thoughts/<project>/shared/plans/`

### /implement_plan

Execute approved plan phase-by-phase:

```bash
/implement_plan WOMONO-123
```

- Reads plan from `thoughts/<project>/shared/plans/`
- Executes each phase with validation
- Commits changes after each phase

### /validate_plan

Verify implementation against plan:

```bash
/validate_plan WOMONO-123
```

- Uses Gemini CLI tools for verification
- Delegates to research agents
- Reports compliance gaps

### /validate_telemetry

Validate locally-emitted OpenTelemetry telemetry:

```bash
/validate_telemetry
```

- Checks against written narrative spec
- Runs generic health check on local OTel stack
- Delegates to observability-driven-development skill

### /commit

Create well-structured git commits:

```bash
/commit "feat: add new feature"
```

- Analyzes changes
- Drafts conventional commit messages
- Executes commits via git

### /debug

Investigate issues during testing:

```bash
/debug "error message"
```

- Examines logs, state, git history
- Uses Gemini CLI tools
- Provides root cause analysis

### /sync skills

Sync all skills to all frontends:

```bash
/sync skills
```

- Runs `ai-harness --sync-docs`
- Updates all 7 tool skill directories
- Validates compliance

### /help

Unified help system:

```bash
/help
/help commands
/help skills
/help workflows
/help practices
/help search <query>
```

## Tool Availability

All commands work in:
- OpenCode
- Claude Code
- Gemini CLI
- Pi
- Codex
- Antigravity
- Wo Coder

## Related

- [f-rr-d Context Engineering](frrd.md)
- [Workflow](guides/getting-started.md#workflow-pattern)
- [AI Engineering Harness](guides/ai-harness/)