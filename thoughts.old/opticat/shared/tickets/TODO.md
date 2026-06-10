# Combined TODO List for Opticat Project

**Latest:** Ticket `011-opticat-wayofwork-rest-api-sync.md` added — documents the WoW REST API endpoints for OptiCat to consume. Next step: implement `wow_api_client.dart` and `wow_sync_engine.dart`.

This document aggregates all outstanding tasks and acceptance criteria from various tickets and plans within the Opticat project. Each item is prefixed with the source file for easy reference.

## From `thoughts/shared/tickets/001-create_claude_gemini_skills.md` (Develop Claude and Gemini Skills based on Existing Agent Functions)

- [ ] A design document is created outlining how each Gemini CLI agent function will be exposed as a skill for Claude and Gemini (e.g., API wrappers, direct function calls, or a translation layer).
- [ ] Proof-of-concept implementations for at least two core functions (e.g., `read_file` and `run_shell_command`) are demonstrated for both Claude and Gemini.
- [ ] Documentation is updated to reflect the new capabilities and how to utilize these skills with Claude and Gemini.
- [ ] The new skills are integrated into the relevant AI platforms, making them accessible for use.

## From `thoughts/shared/tickets/003-integrate_relevant_agents_into_opticat.md` (Integrate Relevant Agents into Opticat Ecosystem)

- [ ] A preliminary study outlining potential agent types, their functionalities, and their integration points within Opticat's architecture is completed.
- [ ] A technical specification for agent communication, data exchange (leveraging Opticat's JSON-based module communication), and security within the offline-first environment is drafted.
- [ ] A proof-of-concept for at least one agent type (e.g., a simple design assistant or a service diagnostic helper) is developed and demonstrated.
- [ ] Documentation for developing and integrating new agents into Opticat is created.

## From `thoughts/shared/tickets/006-find_and_document_opticat_dependencies.md` (Find and Document All System Dependencies for Opticat)

- [ ] A detailed, categorized list of all Flutter/Dart package dependencies, including their versions, extracted from `pubspec.yaml` files.
- [ ] Identification and documentation of any native system libraries or tools required for compilation or runtime (e.g., `clang`, `make`, specific `apt` packages on Linux, Visual Studio components on Windows, Xcode on macOS).
- [ ] Documentation of any required global CLI tools (e.g., `flutter`, `dart`, `deno`, `git`) and their recommended installation methods/versions.
- [ ] Identification of any specific environment variables or configuration settings necessary for development or deployment.
- [ ] The documented dependencies are accurate and sufficient to set up a functional development environment from scratch.

## From `thoughts/shared/tickets/007-integrate_wayofmono_agents.md` (Integrate `wouser` Agent within WayOfMono System with Gemini CLI)

- [ ] `wouser` is successfully installed and initialized project-locally within a `WayOfMono` project directory (simulated for testing purposes).
- [ ] Communication Protocol: A clear and functional communication protocol is established for `Gemini CLI` to invoke `wouser` commands and receive structured output. This might involve `Gemini CLI` executing `wouser` via `run_shell_command` and parsing its stdout/stderr.
- [ ] Task Delegation: `Gemini CLI` can successfully delegate at least two complex general-purpose tasks to `wouser` (e.g., "Summarize the changes in X file," "Analyze the dependencies for the current project").
- [ ] Output Interpretation: `Gemini CLI` can interpret `wouser`'s output (success/failure, generated data, error messages) and present a concise summary to the user.
- [ ] Proof-of-Concept Workflow: A demonstrable end-to-end workflow where `Gemini CLI` uses `wouser` to achieve a specific general-purpose goal is implemented.

## From `thoughts/plans/expose_gemini_cli_functions_as_skills.md` (Expose Gemini CLI Functions as Skills Implementation Plan)

- [ ] Dart Frog server starts successfully: `cd gemini_cli_skills_server && dart pub run dart_frog_cli dev` (or similar command).
- [ ] All defined API endpoints are accessible and respond correctly (e.g., using `curl`).
- [ ] API key authentication successfully blocks unauthorized requests.
- [ ] Unit tests for API endpoints pass.
- [ ] `read_file` endpoint successfully reads content of specified local files.
- [ ] `list_directory` endpoint successfully lists contents of specified local directories.
- [ ] `run_shell_command` endpoint successfully executes simple, safe commands (e.g., `ls`, `echo`) and returns output.
- [ ] Unauthorized requests are consistently rejected by the API.
- [ ] JSON Schema definitions are valid according to their respective formats.
- [ ] Gemini test script successfully invokes `read_file`, `list_directory`, and `run_shell_command` via the local API and processes the results.
- [ ] Claude test script successfully invokes `read_file`, `list_directory`, and `run_shell_command` via the local API and processes the results.
- [ ] AI models correctly interpret the returned function results in their final responses.

## From `thoughts/shared/tickets/011-opticat-wayofwork-rest-api-sync.md` (Sync OptiCat Data to Way of Work REST API)

- [ ] OptiCat can authenticate with WoW using tenant API credentials
- [ ] A new project created in OptiCat appears in WoW's `/api/opticat/projects` within 5 seconds (online)
- [ ] A new building created in OptiCat appears in WoW's `/api/opticat/projects/:id/buildings`
- [ ] A service report completed offline in OptiCat is queued and pushed to WoW when connectivity resumes
- [ ] WoW webhook `POST /api/opticat/webhooks/project-update` triggers a local update in OptiCat
- [ ] Duct canvas layout from OptiCat is accessible via WoW's `GET /api/opticat/aggregat/:id/canvas`
- [ ] Sync failures are logged in OptiCat with retry status
