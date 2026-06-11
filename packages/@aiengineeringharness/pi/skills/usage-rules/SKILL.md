---
name: usage-rules
description: Manage, sync, and search LLM rules and documentation from Elixir dependencies using the `ash-project/usage_rules` library. Use when working on an Elixir/Mix project to provide context-aware package guidelines for the agent.
allowed-tools: Read, Edit, Write, Bash
---

# Elixir Usage Rules Integration

## Philosophy

Large Language Models often struggle with library-specific paradigms and DSLs in the Elixir ecosystem (such as the Ash Framework resource DSL or Phoenix LiveView lifecycle methods), leading to hallucinations. 

The `usage_rules` package solves this by allowing Elixir library authors to ship a `usage-rules.md` guidelines file inside their Hex packages. The `usage_rules` compiler consolidates these dependency guides into your workspace-level rule files (e.g. `AGENTS.md`, `CLAUDE.md`) or directly into your `.agents/skills/` directory, ensuring your AI assistant has local, up-to-date, version-specific knowledge.

---

## 🚀 Step-by-Step Workflow

### 1. Verification & Installation
First, check if the package is configured in the project's dependencies:
*   Inspect `mix.exs` for `:usage_rules`.
*   Alternatively, execute `mix help usage_rules.sync` inside the project root to check if the tasks are available.

If missing, install it using `igniter` (recommended):
```bash
mix igniter.install usage_rules
```
Or manually add it to the `deps` inside `mix.exs`:
```elixir
{:usage_rules, "~> 0.1.0", only: :dev, runtime: false}
```

---

### 2. Configuration (`mix.exs`)
To customize how rules are gathered, configure the `:usage_rules` block in `mix.exs`:

```elixir
defp usage_rules do
  [
    file: "AGENTS.md", # Central workspace rules target file
    usage_rules: [:ash, :ash_postgres, ~r/^ash_/], # Match these packages
    skills: [
      location: ".agents/skills", # Sync compiled rules into skills folders
      build: [
        "ash_framework": [
          description: "Rules for building resources and actions in Ash Framework",
          usage_rules: [:ash, ~r/^ash_/]
        ]
      ]
    ]
  ]
end
```

---

### 3. Synchronizing Rules
Run the synchronization task to fetch the `usage-rules.md` files from your dependency tree and update your workspace rules/skills:

```bash
mix usage_rules.sync
```

You can also pass arguments to target specific rule sheets or specify target folders:
```bash
mix usage_rules.sync AGENTS.md --all --link-to-folder docs
```

Ensure you commit the generated rule files/folders to Git so all agents share this knowledge.

---

### 4. Searching HexDocs (AI-Optimized Search)
If you encounter a compiling error or need to understand how to use a specific function/module in a dependency, use the semantic doc search. The output is structured for both humans and AI parsing:

```bash
mix usage_rules.search_docs <query>
```
*Example:*
```bash
mix usage_rules.search_docs "how to define an resource action in Ash"
```

---

### 5. Inspecting Specific Modules
To lookup exact documentation and rules for a specific Elixir module:

```bash
mix usage_rules.docs Ash.Resource
```
Or for a specific function:
```bash
mix usage_rules.docs Ash.Changeset.change/2
```
