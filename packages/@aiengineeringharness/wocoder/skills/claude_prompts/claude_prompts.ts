// Auto-generated from canonical skill: claude_prompts
// Platform: WoCoder (Node/Deno)
// Description: Claude Code prompt steering expert — knows CLAUDE.md syntax, modular path-based rules, @ file referencing, and output styles. Use when the user wants to configure prompt instructions or output formats for Claude Code.

export const skill = {
  name: "claude_prompts",
  description: "Claude Code prompt steering expert — knows CLAUDE.md syntax, modular path-based rules, @ file referencing, and output styles. Use when the user wants to configure prompt instructions or output formats for Claude Code.",
  tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
  prompt: `> **Platform**: Wo Coder | **Skill**: claude_prompts | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Claude Code Prompt Steering Reference

Claude Code steers model behavior using project-level rules, modular path-targeted rules, file-reference context injection, and output style templates.

---

## 1. Project Steering Rules (\`CLAUDE.md\`)
\`CLAUDE.md\` is the primary instruction manual for the project workspace. Claude Code reads this file at the start of every session.

### Rules for CLAUDE.md
- **Location**: Must be placed in the project root directory.
- **Size Limit**: Keep under 300 lines (aim for ~150 lines or less) to avoid consuming unnecessary token context.
- **Bootstrapping**: Run \`/init\` to generate a base template.
- **Content**: Include build/test/run commands, import rules, styling guides, and key files.

Example structure:
\`\`\`markdown
# My Project Guidelines

## Core Commands
- Build: \`npm run build\`
- Test: \`npm run test\`
- Lint: \`npm run lint\`

## Code Style
- Use ES Modules (ESM)
- Prefer TypeScript types over interfaces
\`\`\`

---

## 2. Modular Path-Targeted Rules (\`.claude/rules/\`)
Modular rules allow targeting specific style guides to specific folders or file patterns.

### Format
- **Location**: \`.claude/rules/*.md\` or global \`~/.claude/rules/*.md\`.
- **YAML Frontmatter**: Use \`globs\` (or \`paths\`) to restrict rule execution:
\`\`\`markdown
---
globs: ["src/api/**/*.ts"]
description: Rules for API development
---
Always validate request payloads before processing.
Do not use console.log in API handlers.
\`\`\`

---

## 3. Context Referencing (\`@\` References)
In conversation or prompt instructions, you can inject file contents dynamically using the \`@\` prefix:
- \`@src/main.ts\` — Inject the \`main.ts\` file contents.
- \`@docs/style-guide.md\` — Inject the project style guide.

---

## 4. Custom Output Styles (\`.claude/output-styles/\`)
Custom output styles dictate how Claude Code structures its responses.
- **Location**: \`.claude/output-styles/*.md\` or global \`~/.claude/output-styles/*.md\`.
- **Precedence**: Project styles override user styles.
- **Frontmatter**:
  - \`name\`: Human-readable name (defaults to file basename).
  - \`description\`: Style description.
  - \`keep-coding-instructions\`: Boolean indicating whether to preserve core developer coding instructions (default: \`true\`).

Example style (\`concise.md\`):
\`\`\`markdown
---
name: Concise Output Style
description: Be extremely direct and skip friendly summaries.
keep-coding-instructions: true
---
Answer the user's coding query directly, showing only code diffs and 1-2 sentence explanations.
\`\`\`
Configure via \`/config\` or \`"outputStyle": "concise"\` in \`settings.json\`.
`,
};
