# Wo — True Gap Analysis (2026-05-13)

## Reality: 17% coverage. 98 wo files vs 587 pi reference files.

| Package | pi ref files | wo files | Coverage | Copy Priority |
|---------|-------------|---------|----------|---------------|
| wo-ai | 125 | 13 | 10% | Medium |
| wo-agent-core | 45 | 21 | 47% | Low (different arch) |
| wo-tui | 54 | 21 | 39% | High |
| wo-coding-agent | 363 | 43 | 12% | **CRITICAL** |
| **Total** | **587** | **98** | **17%** | |

## Strategy: Bulk copy, then adapt.

For each package, the approach is:
1. Copy entire pi-* directory over the wo-* source
2. Find-and-replace `@earendil-works/pi-*` → `@wayofmono/wo-*`
3. Fix type/schema differences
4. Build and iterate until zero errors

## Immediate Priority: wo-coding-agent interactive mode

The 5512-line interactive-mode.ts + 36 components + theme system must be copied wholesale.
Then adapt imports for wo-* packages. This is NOT a rewrite — it's a copy+adapt.

## Next: wo-tui components missing from wo-tui

The interactive mode depends on ~20 components that wo-tui doesn't export yet.
Many exist in pi/tui/src/components/ and need to be copied over.

## Then: wo-ai providers

Only 3 providers (anthropic, openai, gemini) — pi has 18. Missing bedrock, azure,
cloudflare, mistral, vertex, github-copilot, openai-responses, etc.

## Blocking dependencies
- [ ] Copy ref/pi/coding-agent/src/modes/interactive/ → wo-coding-agent (37 files)
- [ ] Copy ref/pi/tui/src/components/ → wo-tui (12+ missing components)
- [ ] Fix all import paths (@earendil-works/pi-* → @wayofmono/wo-*)
- [ ] Copy remaining wo-coding-agent core modules (agent-session-runtime, extensions, etc.)
- [ ] Copy missing wo-ai providers
- [ ] Build all packages with zero errors
- [ ] Test interactive mode end-to-end
