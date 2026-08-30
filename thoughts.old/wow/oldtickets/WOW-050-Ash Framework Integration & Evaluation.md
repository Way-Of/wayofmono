Problem Statement

The system currently uses a Bun/TypeScript/SQLite stack. To increase scalability, declarative resource management, and leverage the Erlang/OTP platform, there is a desire to evaluate and potentially integrate the Elixir-based Ash Framework.

There is currently no bridge or plan for how Elixir/Ash should interact with the existing React frontend and the TypeScript-based agents.
Desired Outcome

A working prototype or architectural plan where the Ash Framework handles core data (resources) and business logic, while maintaining compatibility with the Way of Work platform's current agent ecosystem and frontend.
Context & Background
Current State

    Backend: Bun + SQLite + Express-like router.
    Frontend: React + Tailwind.
    Agents: TypeScript-based with direct access to SQLite/API.

Why This Matters

    Declarative: Ash allows us to define resources, policies, and relations in a way that reduces boilerplate.
    Security: Built-in support for policies (Economics Shield) at the resource level.
    Scalability: Erlang/OTP is industry-leading for distributed systems.

Requirements
Functional Requirements

    Set up a basic Elixir/Phoenix application with Ash Framework.
    Define the first resources (e.g., User, Project) in Ash.
    Create an API (JSON:API or GraphQL via AshGraphql) that the frontend can consume.
    Document "Ash Framework Rules" for future development.

Out of Scope

    Full migration of all existing TypeScript routes in phase 1.
    Switching the database from SQLite to PostgreSQL (unless absolutely necessary for Ash prototypes).

Acceptance Criteria
Automated Verification

    mix test passes in the Elixir project.
    API tests verify that resources can be read/written according to Ash policies.

Manual Verification

    Verify that a React component can fetch data from an Ash resource.
    Verify that an agent can interact with the Ash API.

Technical Notes
Affected Components

    server/ - Potential proxy or successive replacement.
    src/api/ - New service calls to the Elixir backend.
    new-elixir-backend/ - (New directory for the Ash project).

Meta

Created: 2026-06-05 Priority: Medium Estimated Effort: L
