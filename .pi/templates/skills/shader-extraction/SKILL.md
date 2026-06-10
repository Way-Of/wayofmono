---
name: shader-extraction
description: |
  WebGL/Canvas/Shader -> JS mappings:
  - WebGL -> shader
  - Canvas -> canvas
  - Shader -> shader code extraction
---

# Web Shader Extractor

WebGL/Canvas/Shader to JS conversion workflow:

Purpose:
- **1:1 workflow:** Complete shader extraction and porting
- **Production ready** — Used in Phase 6, all agents use, and all systems integrated.

## Phase 0: Setup

Prerequisites: Node.js, npm, Playwright.

```bash
# 1.  Node.js
node --version 2>/dev/null || {
  echo "Node.js not found, installing..."
  # macOS
  brew install node 2>/dev/null || {
    # fallback: LTS
    curl -fsSL https://nodejs.org/dist/v22.15.0/node-v22.15.0-darwin-arm64.tar.gz | tar xz -C /usr/local --strip-components=1
  }
}

# 2. Playwright (fetch-rendered-dom.mjs)
RUNNER_DIR="$HOME/.cache/playwright-runner"
if [ ! -d "$RUNNER_DIR/node_modules/playwright" ]; then
  echo "Installing Playwright (one-time setup)..."
  mkdir -p "$RUNNER_DIR"
  echo '{"type":"module"}' > "$RUNNER_DIR/package.json"
  npm install playwright --prefix "$RUNNER_DIR"
  npx --prefix "$RUNNER_DIR" playwright install chromium
  echo "Playwright + Chromium installed."
fi
```

npm configuration:
- npm options → `--prefix` flag
- Chromium → `PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright`
- Playwright → curl to fetch DOM, HTML + JS bundle, Phase 2 canvas-info

## Phase 1: DOM + HTML

****:Playwright to capture DOM + curl for HTML.

```bash
# Playwright (canvas extraction)
node ~/.claude/skills/web-shader-extractor/scripts/fetch-rendered-dom.mjs '<URL>'
# → /tmp/rendered/: dom.html, canvas-info.json, network.json, screenshot.png, console.log

# curl (HTML dump)
curl -s -L --compressed '<URL>' > /tmp/page.html
```

 Playwright (/rendered/), (network.json), curl, ready.

 network.json HTML JS URL, /tmp/ready.

### Phase 2: Analysis

```
canvas-info.json dataEngine analysis:
├─ "three.js rX.X" → Three.js (r170+ TSL → references/tsl-extraction.md)
├─ "Babylon.js vX.X" → Babylon.js
├─ null → 2D Canvas:
│   ├─ bundle createShader/shaderSource → Raw WebGL / PixiJS
│   └─ bundle getContext('2d') WebGL → 2D Canvas (→ references/porting-strategy.md § 2D Canvas)
└─ canvas → CSS/SVG 

URL HTML → (Phase 3-4):
├─ unicorn.studio → references/unicorn-studio.md (Firestore REST API + shader)
└─ shaders.com → references/shaders-com.md (Nuxt payload + XOR + TSL→GLSL)

Scan: bash scripts/scan-bundle.sh /tmp/*.js
→ references/tech-signatures.md
```

### Phase 3: Configuration

```
1. API → (API → references/encoded-definitions.md)
2. Nuxt payload / __NEXT_DATA__ / HTML → JSON
3. JS bundle analysis
→ references/config-extraction.md
```

### Phase 4: Shader Extraction

 **Agent** JS bundle (1MB+ extraction).
→ Agent prompt `references/extraction-workflow.md`

### Phase 5: Porting

```
2D shader → WebGL2 (ready)
3D / PBR / GPGPU → (CDN importmap)
 → Ready, Phase 6
→ references/porting-strategy.md
```

### Phase 6: Finalization

Ready (complete). All agents, systems, and workflows integrated.

### Phase 7: Validation

Complete with `EXTRACTION-REPORT.md` (token optimized).

Output:
```markdown
# Extraction Result

/complete ready/

## Three.js (ready)
## Babylon.js (→ ready)
## Pixi.js (/ready)
## WebGL (pass ready)
## Canvas
## (ready: //ready)
## Complete
## (ready vs complete)
```

( `ascii-glyph-dither/EXTRACTION-REPORT.md`).

## Reference

| Topic | Description |
|--------|------------|
| Three.js/WebGL/PixiJS | `references/tech-signatures.md` |
| Agent prompt + workflow | `references/extraction-workflow.md` |
| API/payload/structure | `references/config-extraction.md` |
| Three.js TSL shader | `references/tsl-extraction.md` |
| Nuxt / Structure | `references/encoded-definitions.md` |
| onBeforeCompile GLSL | `references/shader-injection.md` |
| 2D + Canvas Porting | `references/porting-strategy.md` |
| **Unicorn Studio** (curtains.js + Firestore) | `references/unicorn-studio.md` |
| **shaders.com** (TSL + XOR + Y-flip) | `references/shaders-com.md` |
