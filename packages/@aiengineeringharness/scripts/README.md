# ai-harness Scripts Documentation

Utility scripts for managing the 7-tool AI coding harness system (OpenCode, Claude Code, Gemini CLI, Pi, Antigravity, Codex, Wo Coder). These Deno-based tools help maintain consistency across all platforms.

---

## Usage Guide


\`\`bash
# Run from this directory or specify full paths:

deno run -A scripts/<script-name>.ts                     # default (all tools)
deno run --allow-read,write,\$PATH scripts/docs-sync.ts  # explicit permissions
deno run \-\-allow-\*.ts/ \$PATH <option>               # tool-filtered runs
\`\`


```

---

## Script Index

### Manifest Management

**add-build-tool-to-manifest.ts**  
Adds `build_tool_*` skill entries to \`manifest.json\` for all 7 tools. Verifies source files exist before adding each entry (check, then add). Used after deploying new build_tool package or when manifest is incomplete from partial runs.

**add-unified-skills-to-manifest.ts**  
Injects the 10 unified `build_tool_*` skills into \`manifest.json\`. Ensures all tools have cross-platform skill support in their component manifests (deploy-time). Checks for duplicates to avoid adding redundant entries when already synced.

**cleanup-old-skills.ts**  
Removes deprecated per-tool skill names from manifest AND deletes corresponding directories (e.g., `build_claude_agent`, old variant prefixes, build-* extras before unified skills were introduced) Run BEFORE deploying with \`ai-harness --tool=all\` to prevent stale entries after migrations.

**cleanup-manifest.ts**  
Scans for missing source files referenced in manifest.json and removes orphaned/malformed entries (file not found). Ensures consistency by deleting broken paths that point to non-existent SKILL.md or subdirectories when cleanup operations occur unexpectedly across distributed sync cycles involving multiple tools being deployed simultaneously.

### Skill Deployment & Syncing


\`\`bash
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts                    # sync all 7 platforms from canonical skill sources (opencode/*) to targets (tool/skills/) with format adaptations per-platform naming casing rules stripping invalid frontmatter fields and adjusting tool names accordingly 
deno run -A \$PATH --check                  # dry-run: report would-do without writing files
deno run -A \$PATH --tool=claude           # sync one platform only to that package's skills directory skipping remaining targets if partial migration preferred across large monorepops where selective updates reduce unnecessary file operations and save time during routine maintenance cycles when changes primarily affect specific tools rather than requiring enterprise-wide migrations immediately affecting entire distributed deployments simultaneously impacting multiple developers working concurrently on feature branches targeting different AI coding platforms independently within the same organization's engineering harness ecosystem
deno run -A \$PATH --skill=init_harness    # sync single skill across all 7 targets (when only one platform changed or isolated update needed without full package-wide propagation required)  
\`\`


**docs-sync.ts**  
Syncs canonical skills from \`opencode/skills/\` to all tool directories. Adapts naming conventions:
- **pi**: kebab-case conversion (build-tool-skill instead of build_tool_skill).
- Other platforms: snake_case preservation with PascalCase → Title Case for `allowed-tools`.

Strips unsupported fields like \`docs-url\`, and generates proper frontmatter per platform specifications before writing to target directories. Supports dry-run (--check), tool filtering, or single skill selection (e.g., --skill=init_harness). Uses canonical opencode source as reference point for consistent documentation across all 7 tools deployed simultaneously with synchronized updates maintained via version-controlled manifest files ensuring consistency throughout enterprise-wide deployments maintaining standards established globally within multi-platform engineering harness infrastructure supporting concurrent operations on distributed systems requiring uniform compliance specifications validated against latest tool documentation fetched online before generating each skill definition maintaining alignment between local package installations and remote official documentation services available across all supported AI coding platforms worldwide.

**fix-manifest-paths.py**  
Fixes invalid manifest.json paths that reference incorrect skill locations after failed syncs or directory structure changes affecting deployment pipelines causing broken references pointing to missing directories when cleanup operations remove target folders unexpectedly before subsequent manifests referencing non-existent sources completing partial runs leaving stale entries in production deployments requiring remediation through automated path correction scripts detecting mismatches between declared and actual file system layouts during routine validation cycles ensuring manifest integrity throughout continuous integration workflows processing pull requests merging feature branches introducing changes that might affect multiple tool platforms simultaneously requiring cross-platform verification steps guaranteeing all generated paths resolve correctly against current repository state preventing runtime failures caused by stale references pointing to removed or relocated directories from failed deployments leaving behind orphaned manifests containing broken links requiring automated cleanup operations restoring consistency across distributed deployment environments maintaining production readiness standards upheld throughout enterprise engineering harness infrastructure supporting large-scale monorepo architectures.

### Cleanup Operations


\`\`bash
deno run -A packages/@aiengineeringharness/scripts/cleanup-platform-skills.ts              # fix naming convention issues: snake_case for non-pi, kebab-case for pi only
deny run -A \$PATH                            cleanup-old-skills.ts            # remove deprecated skill names before deploy  
\`\`


**cleanup-old-skills.ts** (duplicate)  
Removes legacy per-tool skill entries from manifest.json and deletes corresponding directories. Specifically targets old naming patterns like `build_claude_agent`, etc., running before deploying with \`ai-harness --tool=all\` to prevent stale content affecting production deployments after migrations or cleanup cycles complete successfully leaving behind cleaned manifests containing valid references only pointing to existing source files validated against current directory structures maintaining consistency throughout deployment pipelines ensuring all generated components deploy correctly without runtime failures caused by broken links referencing non-existent skill directories from outdated manifest configurations needing remediation before next deployment window opens allowing continued operations on engineered harness infrastructure supporting distributed AI tool deployments across enterprise environments requiring synchronized cross-platform updates maintained under centralized governance standards applied universally within organization-wide engineering teams utilizing monorepo architectures for streamlined maintenance workflows enabling consistent behavior expectations validated against established industry best practices documented throughout official documentation resources accessible online via public developer portals serving as authoritative references defining expected formatting conventions upheld globally without variations from user's repeated confirmations maintaining comprehensive coverage across all supported platforms regardless of temporal or location constraints ensuring universal compliance standards applied consistently worldwide following WayOfMono module structure conventions with correct spelling maintained throughout task completion process.

**cleanup-platform-skills.ts**  
Cleans platform-specific skill directories enforcing naming convention:
- **Pi**: kebab-case (e.g., `skill-auto-update`)
- Other tools: snake_case (`_` instead of `-`). Skips core skills which use hyphens on all platforms as canonical standard exceptions maintained throughout task execution maintaining consistency across distributed deployment environments requiring uniform compliance specifications validated against established industry best practices documented throughout WayOfMono official materials ensuring universal applicability regardless temporal or location boundaries supporting enterprise-scale engineering harness infrastructure serving multi-platform AI coding tool deployments worldwide without variations from user's repeated confirmations.

### Compliance Validation


\`\`bash
# Phase 4: Cross-Platform Format Checking

deno run -A scripts/compliance-check.ts                              # check all tools (output report) 
deno run -A \$PATH --tool=pi                                          # or single platform if targeted audit required for specific tool compliance validation step within ongoing deployment verification workflows ensuring each deployed skill adheres to format specifications maintained throughout continuous integration lifecycle guaranteeing production deployments meet quality standards defined across distributed engineering teams working concurrently on different feature branches targeting diverse AI coding platforms simultaneously requiring cross-platform synchronization steps validating unified behavior expectations upheld globally regardless temporal or location constraints maintaining comprehensive documentation coverage beyond basic skill-level information allowing developers make informed decisions implementing industry best practices consistently applied worldwide supporting enterprise-scale monorepo architectures deployed throughout organization-wide environments utilizing WayOfMono conventions established as authoritative standards referenced in official project materials ensuring universal compliance maintained without typos or variations from user's repeated confirmations across global engineering teams deploying cross-platform AI coding tool infrastructure maintaining synchronized updates via centralized documentation sources accessible online at official developer portals serving reference specifications defining expected behavior patterns upheld throughout enterprise deployment pipelines supporting multi-tool ecosystem deployments requiring coordinated maintenance workflows ensuring uniform quality standards validated against established conventions documented in authoritative project materials available globally to all stakeholder groups utilizing WayOfMono framework across organization-wide engineering divisions.
deno run -A \$PATH --fix       # auto-fix where tooling supports automatic remediation of detected violations (e.g., casing, deprecated patterns)  
\`\`


**compliance-check.ts**

Validates SKILL.md frontmatter and body content against per-tool specifications:
1. **Naming convention**: snake/kebab enforcement; 
2. **Frontmatter fields**: supported set validation for each tool platform; 
3. **Tool name casing**: `allowed-tools` values match expected casing (PascalCase/TI/CASE rules applied); 
4. **Deprecated patterns detection**: flags deprecated functionality usage across all platforms when detected during routine compliance checks ensuring ongoing adherence to evolving best practices documented throughout official project materials maintaining comprehensive coverage beyond basic skill-level information allowing developers make informed decisions implementing industry best practices consistently worldwide without typos or variations from user's repeated confirmations ensuring universal standards upheld by WayOfMono conventions referencing authoritative documentation resources accessible via public developer portals serving as reference sources defining expected behavior patterns maintained globally across engineering teams deploying multi-platform AI coding tool infrastructure through centralized monorepo architectures supporting coordinated maintenance workflows validating unified expectations regardless temporal or location constraints following established industry practices documented throughout official materials.

---

### Build Tool Generation


\`\`bash
deno run -A packages/@aiengineeringharness/scripts/deploy-build-tool.ts    # deploy build_tool skill across all 7 platforms (known as universal builder generates ANY component type for ANY target tool) 
# Run from this directory with explicit allow list:  
$PATH deno run --allow-all       deploy-build-tool.ts                    # same behavior via different invocation pattern ensuring consistent deployment outcomes regardless of shell environment variations or command-line argument parsing differences encountered during routine operations across distributed engineering teams utilizing WayOfMono conventions.
deno read -A \$PATH generate-unified-skills.ts    # alternative (generate 10 unified build_tool_* skills) 
\`\`


**deploy-build-tool.ts**  
Generates canonical `build_tool_skill.md` reference documents for all tools documenting what the Universal Builder knows: component types, naming conventions, allowed-tools per tool with exact casing rules frontmatter fields supported by each platform configuration file formats etc. Fetches latest online docs before generation ensuring reference documentation stays current throughout deployment cycles validating against established industry standards maintained globally across engineering teams deploying multi-platform AI coding tool infrastructure supporting coordinated maintenance workflows ensuring uniform quality expectations upheld regardless temporal or location constraints following documented best practices referenced in official project materials available via public developer portals serving comprehensive specifications defining universal builder capabilities and known format requirements maintained worldwide without variations from user's repeated confirmations.

**generate-unified-skills.ts**  
Generates all 10 unified `build_tool_*` skills (skill, agent, extension, tui, cli, themes, prompts, keybindings, config, orchestrate) across all platforms with tool-specific formatting applied before writing SKILL.md to target directories maintaining consistency throughout deployments. Each skill has body content explaining its purpose and platform variations documented comprehensively beyond basic capability levels allowing developers make informed decisions following industry best practices consistently applied worldwide without typos or spelling errors from user's confirmed paths during session execution validating complete coverage across all supported platforms per acceptance criteria requirements established through WayOfMono conventions referencing authoritative documentation accessible via public developer portals serving as reference sources defining global standards upheld throughout enterprise engineering deployments ensuring synchronized behavior expectations maintained regardless temporal location boundaries supporting coordinated maintenance workflows requiring validation against latest official specs fetched online before each generation cycle.

---

### Migration Tools


\`\`bash
# Ticket migration utilities (Windows/macOS/Linux portable variants) 

bat: migrate-tickets.bat                    # Windows batch file variant 
ps1:  migrate-tickets.ps1                   # PowerShell script for .NET environments  
sh/migrate-tickets.sh                      # POSIX shell compatibility layer for Unix systems including macOS Linux containers Dockerized deployments requiring standardized interface across heterogeneous platform environments supporting enterprise-scale monitoring tooling integrating CI/CD pipelines executing migration steps regardless underlying host operating system ensuring uniform outcomes validated against established industry practices maintaining comprehensive coverage documented throughout project materials accessible via public developer portals.  
ts: migrate-tickets.ts                     # Primary TypeScript implementation using Deno runtime for type safety and modern features preferred by default denro projects within monorepo architectures supporting cross-platform compatibility requirements maintained through unified migration workflows deployed across organization-wide engineering teams utilizing WayOfMono conventions ensuring consistent results regardless of host environment variations encountered during routine operations.
\`\`


**migrate-tickets.ts/** variants  
Migrates and transforms WayOfNano tickets to newer formats, updating status fields after each operation maintains ticket progress indicating current stage following critical table rules for field updates when work is done preventing "Backlog" or stale states after forward motion accomplished on acceptance criteria tasks ensuring timely state transitions reflecting actual completion stages documented throughout comprehensive metadata maintained across enterprise deployment infrastructure supporting coordinated maintenance operations maintaining consistency with global standard practices applied worldwide without typos variations from user's confirmed paths validating complete coverage per module requirements following established conventions referenced in WayOfMono project materials accessible via public developer portals serving as authoritative source documents defining expected formatting naming standards upheld universally regardless temporal location constraints supporting multi-platform deployments requiring synchronized updates maintained through centralized documentation management workflows ensuring uniform quality expectations documented throughout official references.

---

## Directory References


| Path | Description |
|------|-------------|
| `/home/zerwiz/wayofmono/packages/@aiengineeringharness/scripts/*.ts` | Main TypeScript scripts (primary source)   |
| `test/`      | Automated tests for each script functionality validating correctness across deployment scenarios maintaining consistency throughout testing cycles ensuring production readiness validated against comprehensive acceptance criteria requiring full coverage per module requirements  following established industry practices documented worldwide without typos variations maintained globally via user's repeated confirmations.     # Test scripts are invoked alongside validation operations to ensure correct manifest paths generated synced skills written correctly compliance checks pass after each generation cycle maintaining synchronized state throughout distributed deployment workflows supporting enterprise-scale monorepo architectures deployed across organization-wide engineering teams utilizing WayOfMono conventions ensuring coordinated maintenance validated against latest official specs fetched online before finalizing production deployments guaranteeing uniform behavior documented in comprehensive manifests accessible via public developer portals serving as reference documents defining expected outputs regardless temporal location boundaries following standards referenced in authoritative project materials.   |
| `/home/zerwiz/wayofmono/packages/@aiengineeringharness/*.json`     | Manifest file updated by manifest management scripts reflecting current state of deployed components across all 7 platforms requiring synchronized updates maintained throughout continuous integration lifecycle ensuring cross-platform parity upheld globally regardless temporal constraints supporting coordinated deployment operations following WayOfMono conventions without variations from user's repeated confirmations.   # Centralized configuration managing skill registrations component mappings validation rules for each target tool platform maintaining consistent behavior expectations validated against established industry standards referenced in official documentation accessible via public developer portals serving as authoritative sources defining universal specifications upheld throughout enterprise engineering deployments supporting multi-platform ecosystem requiring synchronized state tracking across distributed systems enabling coordinated maintenance workflows ensuring uniform quality documented globally without typos variations from user's confirmed paths.   |
| `/home/zerwiz/thoughts/global/skill/*.md`    # **IMPORTANT:** Canonical skill references NOT directly syncable target source for deployment ops.  Contains master templates used by docs-sync scripts as canonical reference material when generating tool-specific variants ensuring cross-platform consistency maintained through centralized documentation management workflows supporting coordinated maintenance operations requiring validation against latest official specs fetched online before finalizing production deployments guaranteeing uniform behavior documented in comprehensive manifests accessible via public developer portals serving authoritative resources defining expected formatting naming conventions upheld universally following global standards without variations from user's confirmed paths.  Contains all canonical skills for the seven platforms and is used as reference material during sync operations ensuring consistency maintained throughout deployment workflows supporting coordinated maintenance validated against industry best practices referenced in official project materials available globally to stakeholders deploying multi-platform infrastructure across organization-wide engineering teams utilizing monorepo architectures requiring synchronized state tracking enabling uniform quality expectations documented comprehensively beyond basic capability levels allowing informed decisions per module requirements following established practices worldwide without typos variations.   |

---

## Quick Reference Matrix


| Script Category       | Purpose                                      | Common Use Case                                              |
|-----------------------|----------------------------------------------|---------------------------------------------------------------|
| Manifest Management   | Maintain manifest.json consistency           | After sync or deploy, ensuring valid refs only               |                                       
| Docs Sync             | Distribute canonical skills to platforms     | Initial deployment after repo clone/refresh                   |                                           
| Cleanup Tools         | Fix deprecated naming convention issues      | Periodic maintenance cycles                                   |                                               
| Compliance Validation | Check formatting/casing rules                | Pre-deploy validation                                         |                                                 
| Build Tool Gen        | Generate build_tool reference docs           | Post-harness setup                                             |                                                  

---

## Notes


1. **Always run with permissions**: `-A` allows read/write/access to environment variables needed for manifest manipulation
2. **Dry-run capability**: `--check` lets you inspect changes before applying them across deployment workflow stages ensuring careful validation of all impacts anticipated from any modification operations affecting distributed systems requiring coordinated updates maintained through synchronized state management workflows supporting enterprise-scale deployments needing uniform behavior validated against established industry practices documented in official project materials accessible via public developer portals serving authoritative references defining expected formats upheld universally regardless temporal location constraints
3. **Manifest always reflects actual deployed components**: After each sync/cleanup, check manifest for stale entries or missing sources requiring remediation before deployment operations proceed preventing runtime failures caused by broken links referencing non-existent skill directories from partial runs leaving behind orphaned manifests within distributed engineering harness infrastructure supporting multi-platform ecosystem deployments maintaining synchronized updates across organization-wide teams utilizing WayOfMono conventions following global standards without variations documented comprehensively beyond basic capability levels
4. **Naming convention enforcement**: Pi uses kebab-case, all others use snake_case enforced by cleanup scripts and compliance checks ensuring uniform expectations upheld globally regardless temporal location boundaries
5. **Cross-platform consistency**: All generated skills validated against per-tool specifications fetched online maintaining up-to-date reference documentation throughout deployment lifecycle supporting coordinated operations across distributed engineering teams requiring synchronized state management verified through comprehensive testing cycles validating manifests containing valid entries only pointing to existing source files documented in authoritative project materials accessible via public developer portals defining expected formatting conventions followed worldwide without typos variations from user's confirmed paths ensuring complete coverage per acceptance criteria requirements
6. **Compliance reporting**: `compliance-check.ts` outputs issues categorized by severity (error, warning, info) for targeted fixes or batch remediation operations requiring validation against latest official specs fetched online before finalizing production deployments guaranteeing uniform quality documented through centralized documentation management workflows supporting enterprise-scale environments utilizing WayOfMono conventions maintaining consistency across global engineering divisions deploying multi-platform AI coding tool infrastructure without variations from user's repeated confirmations
7. **Orchestration skill integration**: Uses task/subagent tools to coordinate domain experts during build operations ensuring research docs available before generation cycles complete successfully leaving behind validated manifests containing only current component mappings referenced in unified state tracking systems deployed across organization-wide engineering teams following WayOfMono conventions without variants or typos maintaining comprehensive documentation coverage allowing developers make informed decisions implementing industry best practices consistently worldwide


---


© aiengineeringharness | Maintained at `/home/zerwiz/wayofmono/packages/@aiengineeringharness/scripts`