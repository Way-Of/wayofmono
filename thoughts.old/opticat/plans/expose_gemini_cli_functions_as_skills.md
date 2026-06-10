# Expose Gemini CLI Functions as Skills Implementation Plan

## Overview
This plan details the implementation of Phase 1: enabling Claude and Gemini to execute core Gemini CLI agent functions (`read_file`, `list_directory`, `run_shell_command`) via a secure, local HTTP API. This will lay the foundational capabilities for integrating AI models more deeply into the Opticat ecosystem.

## Current State Analysis
The current Gemini CLI agent possesses a suite of powerful tools for interacting with the codebase and local environment. Claude and Gemini models offer function-calling capabilities, allowing them to invoke external tools defined by JSON Schema. There is currently no direct mechanism for these AI models to access the Gemini CLI agent's functions.

## Desired End State
Claude and Gemini will be able to successfully invoke selected Gemini CLI agent functions (`read_file`, `list_directory`, `run_shell_command`) via a secure, local API service. The results of these function calls will be returned to the calling AI model in a structured format, allowing the models to reason and act upon the information.

## What We're NOT Doing
- Implementing a full-blown, production-ready security system (beyond initial API key-based authentication for POC).
- Exposing all available Gemini CLI agent functions in this initial Proof-of-Concept.
- Developing new, application-specific AI agents that integrate directly with the Opticat application itself (this is part of Phase 2, which will build upon this foundational work).
- Implementing complex UI for agent interaction within Opticat.

## Implementation Approach
We will develop a lightweight, local HTTP API service using **Dart Frog**. This service will act as a gateway, receiving function call requests from Claude/Gemini, translating them into invocations of the Gemini CLI agent's internal functions, executing them, and returning the results. Tool definitions compliant with both Claude and Gemini's JSON Schema requirements will be generated and provided to the AI models. The entire setup for the API service will be self-contained within the `gemini_cli_skills_server` directory, promoting a project-local development and execution environment.

## Phase 1: Proof-of-Concept for Core Functions

### Overview
This phase focuses on setting up the API gateway, wrapping the chosen core functions, and demonstrating successful invocation and response handling with both Claude and Gemini models.

### Changes Required:

#### Sub-phase 1.1: Setup Local API Service
**Goal**: Create a basic Dart Frog server capable of receiving HTTP requests in a project-local manner.
**Location**: A new directory, `gemini_cli_skills_server/` at the project root.

**File**: `gemini_cli_skills_server/` (new directory)
**Changes**: Create the directory `gemini_cli_skills_server`.

**File**: `gemini_cli_skills_server/pubspec.yaml`
**Changes**: Manually create this file. Initialize it to define the project and add `dart_frog` as a dependency and `dart_frog_cli` as a dev dependency.
```yaml
name: gemini_cli_skills_server
description: A sample Dart Frog application.
version: 1.0.0+1
publish_to: none

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  dart_frog: ^1.0.0

dev_dependencies:
  build_runner: ^2.4.0
  test: ^1.24.0
  dart_frog_cli: ^1.0.0 # Added for local CLI usage
  shelf_router: ^1.1.0 # Will be used for defining routes if needed explicitly
  shelf_cors_headers: ^0.1.0 # For CORS middleware
```

**File**: `gemini_cli_skills_server/main.dart`
**Changes**: Basic Dart Frog server setup, define a router.

**File**: `gemini_cli_skills_server/routes/_middleware.dart`
**Changes**: Implement CORS headers for local development.

**File**: `gemini_cli_skills_server/.env.example`
**Changes**: Define structure for API_KEY.

#### Sub-phase 1.2: Implement Authentication
**Goal**: Secure the API with a simple API key check.
**Location**: `gemini_cli_skills_server/`

**File**: `gemini_cli_skills_server/routes/_middleware.dart`
**Changes**: Add middleware to validate an `X-API-Key` header against a configured API key.

#### Sub-phase 1.3: Integrate Gemini CLI Agent Functions
**Goal**: Wrap `read_file`, `list_directory`, `run_shell_command` with API endpoints.
**Location**: `gemini_cli_skills_server/routes/`

**File**: `gemini_cli_skills_server/routes/read_file.dart`
**Changes**:
- Define a POST endpoint `/read_file`.
- Expect `file_path` as a parameter in the request body.
- Call the internal `read_file` tool (or a simulated version).
- Return file content or an error.

**File**: `gemini_cli_skills_server/routes/list_directory.dart`
**Changes**:
- Define a POST endpoint `/list_directory`.
- Expect `dir_path` as a parameter.
- Call the internal `list_directory` tool.
- Return directory contents or an error.

**File**: `gemini_cli_skills_server/routes/run_shell_command.dart`
**Changes**:
- Define a POST endpoint `/run_shell_command`.
- Expect `command` and optionally `dir_path` as parameters.
- Call the internal `run_shell_command` tool.
- Return command output, exit code, or an error.
- **Crucial**: Implement initial sanitization/validation for the `command` input to prevent arbitrary command execution even in POC (e.g., allow only specific commands or block dangerous ones).

### Success Criteria:

#### Automated Verification:
- [ ] Dart Frog server starts successfully: `cd gemini_cli_skills_server && dart pub run dart_frog_cli dev` (or similar command).
- [ ] All defined API endpoints are accessible and respond correctly (e.g., using `curl`).
- [ ] API key authentication successfully blocks unauthorized requests.
- [ ] Unit tests for API endpoints pass.

#### Manual Verification:
- [ ] `read_file` endpoint successfully reads content of specified local files.
- [ ] `list_directory` endpoint successfully lists contents of specified local directories.
- [ ] `run_shell_command` endpoint successfully executes simple, safe commands (e.g., `ls`, `echo`) and returns output.
- [ ] Unauthorized requests are consistently rejected by the API.

---

## Phase 2: Define Tools for Claude/Gemini (POC)

### Overview
This phase focuses on creating the JSON Schema definitions for the exposed functions, making them consumable by Claude and Gemini, and setting up basic test environments for invocation.

### Changes Required:

#### Sub-phase 2.1: Generate JSON Schemas
**Goal**: Create JSON Schema definitions for the `read_file`, `list_directory`, and `run_shell_command` functions.
**Location**: A new directory, e.g., `ai_model_tool_definitions/` at the project root.

**File**: `ai_model_tool_definitions/gemini_tools.json`
**Changes**: Define tools in Gemini's format.

**File**: `ai_model_tool_definitions/claude_tools.json`
**Changes**: Define tools in Claude's format.

#### Sub-phase 2.2: Setup AI Model Test Environments
**Goal**: Prepare basic scripts to interact with Claude and Gemini using the defined tools.
**Location**: A new directory, e.g., `ai_model_tests/` at the project root.

**File**: `ai_model_tests/gemini_poc.py` (or similar language)
**Changes**:
- Load `gemini_tools.json`.
- Initialize Gemini model.
- Send a prompt that triggers a function call (e.g., "Read the contents of README.md").
- Parse the `function_call` response.
- Make an HTTP call to the local API service.
- Send the `function_result` back to Gemini.
- Print Gemini's final response.

**File**: `ai_model_tests/claude_poc.py` (or similar language)
**Changes**:
- Load `claude_tools.json`.
- Initialize Claude model.
- Send a prompt that triggers a tool use.
- Parse the `tool_use` response.
- Make an HTTP call to the local API service.
- Send the `tool_result` back to Claude.
- Print Claude's final response.

### Success Criteria:

#### Automated Verification:
- [ ] JSON Schema definitions are valid according to their respective formats.

#### Manual Verification:
- [ ] Gemini test script successfully invokes `read_file`, `list_directory`, and `run_shell_command` via the local API and processes the results.
- [ ] Claude test script successfully invokes `read_file`, `list_directory`, and `run_shell_command` via the local API and processes the results.
- [ ] AI models correctly interpret the returned function results in their final responses.

---

## Testing Strategy
- **Unit Tests:** Implement unit tests for each API endpoint in the Dart Frog service to ensure correct parsing of requests, authentication, and internal function calls.
- **Integration Tests:** Write integration tests that simulate HTTP requests to the Dart Frog API, verifying the end-to-end flow from request to response.
- **AI Model Integration Tests:** Use the `ai_model_tests` scripts to perform end-to-end testing with actual Claude and Gemini models, ensuring they can correctly identify, invoke, and interpret the results of the exposed functions.
- **Security Testing:** Basic tests for API key validation and command injection attempts on `run_shell_command`.

## References
- Original ticket: `thoughts/tickets/create_claude_gemini_skills.md`
- Related ticket: `thoughts/shared/tickets/integrate_relevant_agents_into_opticat.md`
- Vision for Agents: `AGENTS.md`
