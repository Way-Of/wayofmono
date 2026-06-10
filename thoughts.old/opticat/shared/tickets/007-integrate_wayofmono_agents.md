---
title: Integrate `wouser` Agent within WayOfMono System with Gemini CLI
labels: [enhancement, ai, agents, wayofmono]
assignees: []
status: Open
---

## Description

This ticket proposes the integration and collaboration of the `wouser` AI agent from the `WayOfMono` ecosystem with the `Gemini CLI` agent. The `WayOfMono` project is a monorepo for high-performance coding agents, emphasizing project-local, contained environments. This integration aims to leverage `wouser`'s general-purpose user agent SDK and CLI capabilities in conjunction with the `Gemini CLI`'s broader orchestration and multimodal interaction strengths.

This initiative will explore how `Gemini CLI` can effectively utilize `wouser` for tasks that require generalized user agent functionality, such as interacting with various tools, managing workflows, and providing SDK integration points, all within a `WayOfMono` project context.

## Proposed Agent Roles and Interaction:

*   **`wouser` (General-Purpose User Agent SDK & CLI):** Will be primarily responsible for executing generalized agent functionalities. This includes tasks that might involve interacting with different tools, managing user-defined workflows, and potentially serving as an SDK endpoint for custom agent logic. It operates within the `WayOfMono` project's `.wo/` contained environment.
*   **`Gemini CLI` (Orchestrator/High-Level Assistant):** Will serve as the high-level interface. It will receive user requests, understand the intent, decide when to delegate generalized agent tasks to `wouser`, interpret `wouser`'s output, and formulate a comprehensive response to the user. It can also leverage its multimodal capabilities and broader tool access (as outlined in `create_claude_gemini_skills.md`) for research, file system operations, or other general tasks.

## Benefits of Integration:

*   **Expanded General-Purpose Agent Capabilities:** Combine Gemini CLI's orchestration with `wouser`'s flexible user agent functionalities.
*   **Context-Aware Operations:** Leverage `WayOfMono`'s project-local context for highly relevant agent actions.
*   **Improved User Experience:** A single high-level interface (Gemini CLI) to access powerful, general-purpose agent capabilities.
*   **Demonstration of Agent Interoperability:** Showcase how different AI agent frameworks can collaborate effectively to serve user needs.

## Acceptance Criteria

-   **`wouser` Setup:** `wouser` is successfully installed and initialized project-locally within a `WayOfMono` project directory (simulated for testing purposes).
-   **Communication Protocol:** A clear and functional communication protocol is established for `Gemini CLI` to invoke `wouser` commands and receive structured output. This might involve `Gemini CLI` executing `wouser` via `run_shell_command` and parsing its stdout/stderr.
-   **Task Delegation:** `Gemini CLI` can successfully delegate at least two complex general-purpose tasks to `wouser` (e.g., "Summarize the changes in X file," "Analyze the dependencies for the current project").
-   **Output Interpretation:** `Gemini CLI` can interpret `wouser`'s output (success/failure, generated data, error messages) and present a concise summary to the user.
-   **Proof-of-Concept Workflow:** A demonstrable end-to-end workflow where `Gemini CLI` uses `wouser` to achieve a specific general-purpose goal is implemented.

## Technical Considerations

*   **Environment Management:** How `Gemini CLI` will ensure `wouser` executes within the correct `WayOfMono` project context (e.g., `cd` into the project directory, setting environment variables).
*   **Input/Output Handling:** Standardizing the format for commands sent to `wouser` and parsing the output received back.
*   **Error Handling:** Gracefully managing errors or unexpected output from `wouser`.
*   **Resource Management:** Ensuring efficient resource usage during `wouser` execution.
*   **Security:** Safeguarding against malicious commands or unintended side effects when `Gemini CLI` invokes `wouser` via `run_shell_command`.
*   **Dependency Resolution:** Ensuring `wouser`'s local dependencies are correctly resolved.

## References
- `WayOfMono` GitHub Repository: `https://github.com/zerwiz/wayofmono`
- Related Plan: `thoughts/plans/expose_gemini_cli_functions_as_skills.md`
- Vision for Agents: `AGENTS.md`