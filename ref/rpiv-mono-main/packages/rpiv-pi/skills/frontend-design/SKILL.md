---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Use when the user asks to build web components, pages, or applications, or wants design guidance. Also use during frontend UI work — pass `--headless` for projects with established styles to inject guidelines without the interview checkpoint."
argument-hint: "[--headless]"
---

# Frontend Design

You are tasked with injecting tailored visual design guidance into the agent's context, preventing generic "AI slop" aesthetics in frontend output. The workflow has three steps: (1) scan the project for existing style context, (2) run an adaptive aesthetic checkpoint across 7 dimensions (skipping settled ones), (3) synthesize tailored guidelines + anti-slop guardrails.

Two invocation modes:
- **Full checkpoint** (default): scan → 7-dimension interview → inject guidelines
- **Headless** (`--headless`): scan → inject findings as guidelines → stop (no interview)

**How it works**:
- Parse input and detect invocation mode (Step 1)
- Scan for existing style context via codebase-locator agent (Step 2)
- Run adaptive aesthetic checkpoint via ask_user_question (Step 3)
- Synthesize and inject tailored guidelines + anti-slop list (Step 4)

## Input: `$ARGUMENTS`

## Step 1: Input Handling

1. **No argument provided** — full checkpoint mode:
   ```
   I'll guide your frontend design direction. Provide one of:

   `/skill:frontend-design`                — full aesthetic checkpoint (scan + interview + guidelines)
   `/skill:frontend-design --headless`     — scan-only: inject style findings without interview
   ```
   Then wait for input.

2. **`$ARGUMENTS` contains `--headless`** — headless mode:
   - Set mode to `headless`. Proceed to Step 2. After Step 2, skip Step 3 and go directly to Step 4.

3. **Otherwise** — full checkpoint mode:
   - Set mode to `full`. Proceed to Step 2.

4. **Read any context files mentioned** in the prompt (DESIGN.md, style guides, tickets) FULLY before proceeding.

**No agent dispatch in Step 1.** Only `Read` on user-named paths.

## Step 2: Style Discovery (parallel agents)

Dispatch a single codebase-locator agent to scan for existing style context.

**Agent — Style system scan:**
- subagent_type: `codebase-locator`
- description: "Scan for style systems"
- prompt: "Scan the project for existing style context. Look for: (1) DESIGN.md files (Google's design spec), (2) design token files (tokens.css, tokens.json, design-tokens.*), (3) Tailwind/CSS framework configs (tailwind.config.*, postcss.config.*), (4) style guide or brand guideline files, (5) CSS custom property definitions (--color-*, --font-*, --spacing-*), (6) component library setups (Storybook, component indexes). Return file paths grouped by category with line offsets."

Wait for the agent to complete before proceeding.

### Scan Findings Summary

Present findings grouped by dimension:
- **DESIGN.md**: found at `path/to/DESIGN.md` (or "none found")
- **Tokens/Variables**: found at `path/to/tokens.css` with N custom properties (or "none found")
- **Framework config**: found at `path/to/tailwind.config.ts` (or "none found")
- **Style guides**: found at `path/to/style-guide.md` (or "none found")
- **Component library**: found at `path/to/components/` with N files (or "none found")

### If DESIGN.md found

Read it FULLY using the Read tool. This is the primary style source — its decisions take precedence over scan findings for the checkpoint.

### Headless exit

**If mode is `headless`:**
1. Synthesize scan findings into concise style guidelines (respect what exists, note what's missing)
2. Inject as assistant message (see Step 4 output format)
3. **Stop — do not proceed to Step 3.**

### Full checkpoint continuation

**If mode is `full`:** Proceed to Step 3. Carry scan findings forward — they inform skip logic and pre-fill recommendations.

## Step 3: Aesthetic Checkpoint

Ask the developer about aesthetic direction across 7 dimensions. Use `ask_user_question` — one question at a time, wait for the answer before asking the next. Lead each question with the recommended option labeled `(Recommended)`.

### Skip Logic

Before asking each dimension, check if the scan (Step 2) found a **complete system** for that dimension. If yes, note the finding and skip the question. If the system is partial, still ask but pre-fill the recommendation from the scan.

**Skip thresholds by dimension** (agent judgment — these are examples, not rigid checklists):
- **Typography**: skip if font imports + type scale + CSS variables for font families all exist
- **Color**: skip if color palette tokens + theme variables + accent colors all exist
- **Motion**: skip if transition/animation tokens or a motion library is configured
- **Spatial**: skip if spacing scale tokens + layout system (grid/flex patterns) both exist
- **Backgrounds**: skip if texture/gradient/pattern definitions exist in the style system
- **Tone/Mood**: never skip — conceptual, not detectable from code
- **Differentiation**: never skip — conceptual, requires developer input

When skipping, record: "Dimension X: [finding from scan] — respecting existing system."

### Dimension 1: Tone & Mood

Ask via `ask_user_question`:
- Question: "What aesthetic tone should this interface convey?"
- Header: "Tone"
- Options (pick 3-4 that fit the project context, always include the first):
  - "Editorial / magazine (Recommended)" (if no prior context) — refined typography, generous whitespace, content-first
  - "Brutally minimal" — stripped to essentials, monochrome, no decoration
  - "Playful / toy-like" — rounded shapes, bright colors, bouncy interactions
  - "Retro-futuristic" — CRT textures, neon accents, terminal aesthetics
  - "Luxury / refined" — dark palettes, serif fonts, gold accents, subtle motion
  - "Brutalist / raw" — exposed structure, harsh contrasts, system fonts used intentionally
  - "Art deco / geometric" — ornamental patterns, metallic accents, symmetrical layouts
  - "Soft / pastel" — light tones, rounded corners, gentle gradients
- If the DESIGN.md or scan findings suggest a tone, make that the `(Recommended)` option.

### Dimension 2: Color Direction

Ask via `ask_user_question`:
- Question: "What color direction fits this interface?"
- Header: "Color"
- Options:
  - "Dark mode, warm accents" — dark backgrounds, amber/gold/orange highlights
  - "Dark mode, cool accents" — dark backgrounds, blue/teal/purple highlights
  - "Light mode, muted palette" — off-white backgrounds, desaturated earth tones
  - "Light mode, vibrant" — white/light backgrounds, bold primary colors
  - "High contrast" — stark black/white with one accent color
- If scan found color tokens/theme, make the closest match the `(Recommended)` option.

### Dimension 3: Typography

Ask via `ask_user_question`:
- Question: "What typography direction for this interface?"
- Header: "Typography"
- Options:
  - "Serif display + sans body" — editorial feel, character in headings
  - "All sans-serif, distinctive pairing" — modern, clean, pair unexpected fonts
  - "Monospace-forward" — terminal/code aesthetic, developer tools
  - "Mixed: display serif + monospace accents" — editorial meets technical
- If scan found font imports/type scale, pre-fill the `(Recommended)` option from what exists.

### Dimension 4: Motion

Ask via `ask_user_question`:
- Question: "How much motion and animation?"
- Header: "Motion"
- Options:
  - "Subtle micro-interactions" — hover effects, smooth transitions, gentle reveals
  - "Bold page-load choreography" — staggered reveals, dramatic entrances, scroll-triggered
  - "CSS-only, no JS" — pure CSS transitions and animations, lightweight
  - "Static / minimal" — no animation, focus on typography and layout
- If scan found animation tokens/motion library, pre-fill the `(Recommended)` option.

### Dimension 5: Spatial Composition

Ask via `ask_user_question`:
- Question: "What spatial composition approach?"
- Header: "Spatial"
- Options:
  - "Generous whitespace, asymmetric" — editorial layout, breathing room, offset elements
  - "Dense, information-rich" — dashboard-style, maximum content per viewport
  - "Grid-breaking, overlapping" — elements that break the grid, layered composition
  - "Structured grid, symmetric" — traditional layout, predictable alignment
- If scan found spacing tokens/grid system, pre-fill the `(Recommended)` option.

### Dimension 6: Backgrounds & Texture

Ask via `ask_user_question`:
- Question: "What background treatment?"
- Header: "Backgrounds"
- Options:
  - "Solid with subtle noise/grain" — flat color with texture overlay for depth
  - "Gradient mesh" — multi-color gradients, blurred shapes, atmospheric
  - "Geometric patterns" — repeating shapes, lines, or decorative elements
  - "Clean solid, no texture" — pure flat color, let content be the visual
- If scan found background/texture definitions, pre-fill the `(Recommended)` option.

### Dimension 7: Differentiation

Ask via `ask_user_question`:
- Question: "What makes this interface UNFORGETTABLE? What's the one thing someone will remember?"
- Header: "Differentiation"
- Options (pick 2-3 that fit, always include an open-ended):
  - "Typography as art" — oversized, expressive type as the primary visual element
  - "Unexpected interaction" — a signature interaction pattern that surprises
  - "Atmosphere" — immersive background/texture that sets a mood
  - "Layout rebellion" — breaks every grid convention intentionally
- This dimension is always asked — it cannot be derived from scan findings.

### Record Checkpoint Answers

After all 7 dimensions (or all unsettled dimensions if some were skipped), compile the answers into a structured record:
- Each settled dimension: "Dimension: chosen option"
- Each skipped dimension: "Dimension: [existing finding] — respecting existing system"

Carry this record to Step 4 for guideline synthesis.

## Step 4: Guideline Synthesis

Combine scan findings (Step 2) and checkpoint answers (Step 3, or scan-only findings in headless mode) into tailored aesthetic guidelines. Emit as your own assistant message — this primes your context for all subsequent frontend code generation.

### Output Format

Structure the guidelines as a concise, actionable brief:

```markdown
## Frontend Design Guidelines

**Tone**: {chosen tone} — {1-sentence description of how it manifests}
**Color**: {chosen direction} — {specific palette suggestion: primary, accent, background}
**Typography**: {chosen direction} — {specific font suggestions: display + body}
**Motion**: {chosen level} — {specific approach: CSS transitions, scroll triggers, etc.}
**Spatial**: {chosen composition} — {layout approach: grid, whitespace, asymmetry}
**Backgrounds**: {chosen treatment} — {specific texture/gradient/solid approach}
**Differentiation**: {chosen differentiator} — {how to make it unforgettable}

{For each skipped dimension:}
**{Dimension}**: Respecting existing system — {brief description of what was found at `file:line`}

### NEVER Generate

- Overused display fonts: Inter, Roboto, Arial, system-ui as hero/display type
- Clichéd color schemes: purple-to-blue gradients on white backgrounds, generic "SaaS blue"
- Predictable layouts: centered card stacks, hero-image-then-three-columns, cookie-cutter navbars
- Cookie-cutter component patterns: identical rounded cards with shadow-md, every section with max-w-7xl mx-auto
- Generic motion: fade-in on every scroll, identical bounce animations, no intentional choreography

{If DESIGN.md was NOT found in Step 2:}

**Note**: No DESIGN.md found in this project. Consider creating one to codify these design decisions for future reference. See Google's DESIGN.md spec for format guidance.
```

### Injection

Emit the complete guidelines as your own assistant message. Do NOT write to a file. Do NOT use `pi.sendMessage`. The guidelines become part of the conversation transcript — they survive compaction and inform all subsequent turns.

If in headless mode, the guidelines should be briefer — focus on what the scan found and how to respect it, skip the full checkpoint synthesis.

## Important Notes

- **Frontmatter**: `allowed-tools` is intentionally omitted — the skill inherits `Agent`, `ask_user_question`, `Read`, `Write`, `Bash`, `Glob`, `Grep`. Do NOT re-add the line.
- **Always scan before asking**: Step 2 (style discovery) always runs before Step 3 (checkpoint). Never ask aesthetic questions without first checking what exists.
- **One question at a time**: Use `ask_user_question` for each dimension individually. Never batch multiple dimensions into one call.
- **Never ask confirmatory questions**: Do not ask "does this look good?" or "want to adjust?" at the end. The guidelines ARE the output — emit them and stop.
- **Skip logic is judgment, not rules**: The skip thresholds are examples. If a project has a partial system that's clearly intentional (e.g., 3 custom font variables but no full scale), skip and note it.
- **Headless mode exits after Step 2**: When `--headless` is passed, scan → inject findings → stop. Do not proceed to Step 3.
- **Anti-slop list is always included**: Every invocation (full or headless) includes the NEVER Generate list. This is not optional.
- **DESIGN.md takes precedence**: If a DESIGN.md file is found, its decisions override scan findings for the checkpoint. Read it fully before asking questions.
- **Guidelines are inline, not persisted**: The output is an assistant message, not a file. If the developer wants to persist the guidelines, they should create a DESIGN.md manually.
- **No template files**: This skill is a single SKILL.md. Do not create `templates/` or `examples/` subdirectories.
