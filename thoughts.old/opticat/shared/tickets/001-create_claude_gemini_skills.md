---
title: Develop Claude and Gemini Skills based on Existing Agent Functions
labels: [enhancement, ai, skills]
assignees: []
status: Open
---

## Description

This ticket outlines the development of new skills for Claude and Gemini. These skills should leverage the existing functions available to the current Gemini CLI agent to expand the capabilities of Claude and Gemini within the project ecosystem.

The goal is to enable Claude and Gemini to perform similar operations and interactions with the codebase and system environment as the current Gemini CLI agent, by translating the agent's available tools into callable skills for both AI models.

## Current Gemini CLI Agent Functions to be Mapped:

The following functions are available to the current Gemini CLI agent and should be considered for skill creation:

- `update_topic`
- `list_directory`
- `read_file`
- `grep_search`
- `glob`
- `replace`
- `write_file`
- `web_fetch`
- `run_shell_command`
- `list_background_processes`
- `read_background_output`
- `google_web_search`
- `ask_user`
- `write_todos`
- `enter_plan_mode`
- `invoke_agent`
- `activate_skill`

## Acceptance Criteria

- A design document is created outlining how each Gemini CLI agent function will be exposed as a skill for Claude and Gemini (e.g., API wrappers, direct function calls, or a translation layer).
- Proof-of-concept implementations for at least two core functions (e.g., `read_file` and `run_shell_command`) are demonstrated for both Claude and Gemini.
- Documentation is updated to reflect the new capabilities and how to utilize these skills with Claude and Gemini.
- The new skills are integrated into the relevant AI platforms, making them accessible for use.

## Technical Considerations

- How to handle authentication and authorization for Claude and Gemini when accessing system resources via these skills.
- Ensuring secure execution of commands (`run_shell_command`) by Claude and Gemini.
- Error handling and feedback mechanisms for skill execution.
- Potential performance implications of skill invocation by AI models.

---

## Related Plans
- [Expose Gemini CLI Functions as Skills (Implementation Plan)](../plans/expose_gemini_cli_functions_as_skills.md)
