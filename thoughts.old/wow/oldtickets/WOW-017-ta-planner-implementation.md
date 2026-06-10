# [WOW-017] TA-Planner System Implementation

## Problem Statement

Creating Trafikanordningsplaner (TA-planer) is currently a manual process that requires deep knowledge of complex and frequently updated Swedish regulations (APV v5.0). There is no integrated way to fetch live road data (speed, traffic volume) or validate plans against safety standards within the `wayofwork` system.

## Desired Outcome

A fully integrated TA-Planner module in the `wayofwork` UI that allows users to:
1. Fetch live road data via Trafikverket APIs.
2. Conduct digital risk assessments.
3. Select from a library of official TDOK 2024:0043 sketches.
4. Automatically validate plans against safety rules (e.g., TMA requirements).

## Context & Background

### Current State
Users must manually look up regulations in PDFs or external websites. Data like speed limits must be manually entered or guessed. There is no automated validation.

### Why This Matters
Reduces the risk of safety violations, speeds up the planning process, and ensures compliance with the September 2024 regulatory overhaul (APV v5.0).

## Research & Technical Specifications

### 1. Regulatory Framework (APV v5.0 - Sept 2024)
- **V3-Principle**: Planning must prioritize **Varna** (Warn), **Vägleda** (Guide), and **Värna** (Protect).
- **Competence Levels (TDOK 2018:0371 v2.0)**:
  - **Step 2.1**: Mandatory for TMA drivers and intermittent work.
  - **Step 2.3**: New "Skyddsanordningsansvarig" role responsible for safety device placement.
- **TMA Technical Requirements (TDOK 2012:86 v5.0)**:
  - **Battenburg Patterns**: Mandatory high-visibility markings.
  - **Backing Safety**: Technical warning systems required when reversing.
  - **Brake Control**: Specific stationary requirements upon impact.
- **Physical Protection (Barriers)**:
  - **Capacity Classes**: (T1, T2, T3) selected based on speed and volume.
  - **Working Width (W-mått)**: Required space behind a barrier for deflection; no personnel/material allowed in this zone.
- **Planning Standards**:
  - **TDOK 2024:0043**: Principal sketches for traffic arrangement.
  - **Speed Limits**: TMA generally required for speeds >60 km/h.

### 2. Administrative & Submission (FIFA)
- **FIFA System**: Trafikverket's web portal for reporting and permits.
- **Workflow**:
  1. **Register Item**: Road, location, time.
  2. **Upload TA-Plan**: Faktablad (Admin data) + Sketches + Risk Assessment.
  3. **Permission**: Wait for Trafikverket traffic engineer approval.
  4. **Report Start/Stop**: Real-time reporting in field via FIFA or Traffic Central (TC).

### 3. Data Integration (Trafikverket Open API / Trafiklab)
- **Endpoint**: `https://api.trafikinfo.trafikverket.se/v2/data.json`
- **Authentication**: API Key via Trafiklab.
- **Query Format**: HTTP POST with XML-based query logic.
- **Key Data Objects**:
  - `SpeedLimit`: Retrieve current legal speed for a road segment.
  - `TrafficFlow`: Retrieve ÅDT (Årsmedeldygnstrafik) for volume-based safety decisions.
  - `RoadGeometry`: For mapping and distance calculations.

### 3. Validation Logic (Validation Engine)
- **TMA Trigger**: If `SpeedLimit` > 60 km/h AND `WorkType` is not exempted → Flag TMA required.
- **Safety Distances**: Calculate `Skyddsavstånd` (Longitudinal/Lateral) based on `SpeedLimit` and `ProtectionClass`.
- **Competence Check**: Ensure `ProposedPersonnel` have Step 2.1 (for TMA) or 2.3 (for device setup) registered.

### 4. Sample Validation Rules (Heuristics)
*These values are indicative based on TDOK 2012:86 and should be verified via API/Official tables:*
- **Speed ≤ 50 km/h**:
  - TMA: Optional/Rare.
  - Longitudinal Safety Distance: ~5-10m.
  - Lateral Distance: ~0.5m.
- **Speed 60-70 km/h**:
  - TMA: Mandatory for most work types.
  - Longitudinal Safety Distance: ~20-30m.
  - Lateral Distance: ~1.0m.
- **Speed 80-100 km/h**:
  - TMA: Strictly Mandatory.
  - Longitudinal Safety Distance: ~50m+.
  - Lateral Distance: ~1.5m - 2.0m.
- **V3-Check**: Ensure "Varna" (Signs) starts at least 150-400m before the work zone depending on speed.

### 5. UI/UX Strategy (Hybrid Approach)
Based on industry standards (ISY Road, Bluebeam), the module will use a hybrid workflow:
1. **The Wizard (Data Entry)**: A multi-step form to collect project metadata, fetch API data (speed/ÅDT), and perform the initial risk assessment.
2. **The Map Canvas (Visual Planning)**: An interactive map where users can drag-and-drop elements from a "Toolbox Sidemenu" (categorized Swedish road signs, TMA vehicles, barriers).
3. **The Smart Inspector**: A real-time validation panel adjacent to the map that flags safety violations (e.g., "Warning: TMA missing for 90 km/h road") based on the Validation Engine rules.

## Requirements

### Functional Requirements
- [x] Backend service `server/api/trafikverket.ts` to proxy Trafikverket Open API calls.
- [x] Frontend page `src/pages/TAPlanner/` with a multi-step planning wizard.
- [x] Digital library of TDOK 2024:0043 sketches.
- [x] Validation engine `src/utils/ta-validation.ts` for automated safety checks.
- [x] Database support via `ta_plans` table (already added to schema).
- [x] **Visual Integration:** Implement map-based planning (Leaflet/OpenStreetMap), drag-and-drop signage/cones, and automated screenshot capture of the plan canvas (Zoom and screenshot reliability improved).
- [x] **Detail View**: Enable opening plans to view the generated map overlay.

## References & Web Sources

### Official Regulations & Standards (Trafikverket)
- **[Main APV Hub](https://bransch.trafikverket.se/for-dig-i-branschen/Arbetsmiljo-och-sakerhet/Arbete-pa-vag/)**: Primary source for all "Arbete på väg" updates.
- **[TDOK 2012:86 (Krav)](https://bransch.trafikverket.se/for-dig-i-branschen/Arbetsmiljo-och-sakerhet/Arbete-pa-vag/Regelverk/)**: Technical requirements (v5.0 Sept 2024).
- **[TDOK 2024:0043 (Skisser)](https://bransch.trafikverket.se/for-dig-i-branschen/Arbetsmiljo-och-sakerhet/Arbete-pa-vag/Regelverk/)**: Official Principal Sketches library.
- **[Competence Requirements (Step 1-3)](https://bransch.trafikverket.se/for-dig-i-branschen/Arbetsmiljo-och-sakerhet/Arbete-pa-vag/Kompetenskrav-i-upphandlad-verksamhet/)**: TDOK 2018:0371 v2.0 details.
- **[TA-plan Planning Guide](https://bransch.trafikverket.se/for-dig-i-branschen/Arbeta-med-vagunderhall/Arbete-pa-vag/Trafikanordningsplaner-TA-planer/)**: Official guidance for creating plans.

### API & Technical Resources
- **[Trafiklab.se](https://www.trafiklab.se/)**: Developer portal for Trafikverket APIs.
- **[Trafikverket API Console](https://api.trafikinfo.trafikverket.se/Console)**: Live testing tool for NVDB queries (SpeedLimit, TrafficFlow).
- **[Vägtrafikflödeskartan](https://vtf.trafikverket.se/)**: Visual tool for ÅDT (traffic volume) verification.

### Legal & Safety Authorities
- **[Väglagen (1971:948)](https://www.riksdagen.se/sv/dokument-lagar/dokument/svensk-forfattningssamling/vaglag-1971948_sfs-1971-948)**: Swedish Road Act.
- **[Arbetsmiljölagen (1977:1160)](https://www.av.se/arbetsmiljoarbete-och-inspektioner/lagar-och-regler-om-arbetsmiljo/arbetsmiljolagen/)**: Work Environment Act.
- **[ID06 System](https://id06.se/)**: Competence registration and verification.

### Industry Tools (Benchmarking)
- **[ISY Road](https://norconsultdigital.se/produkter/isy-road/)**: Industry standard for municipal TA-plan management.
- **[TA-planer.se](https://ta-planer.se/)**: Example of a digital TA-planning service.

## Acceptance Criteria
- Direct digital submission to Trafikverket (FIFA/ISY Road) in this phase.
- CAD-style drawing tools (referencing sketches is enough for now).

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`
- [ ] Unit tests for `ta-validation.ts` cover key TMA and safety distance rules.

### Manual Verification
- [x] Successfully fetch road data for a given road number/coordinate.
- [x] Validation engine correctly flags a 100 km/h road as requiring a TMA vehicle.
- [ ] Risk assessment PDF/JSON can be generated.

## Technical Notes

### Agent Cannot Access Internet
The LLM agent used for TA-Planner chat (and all workspace agents) **cannot access the internet**. This means:
- All Swedish regulation details, dimensions, and placement rules must be **embedded in the skill/agent definition files** (`.wo/skills/tma/map-objects.md`, `.wo/agents/tma-planner.md`).
- The agent cannot fetch live Trafikverket regulation updates, check current TDOK versions, or browse online resources.
- Any regulation change requires manual update of the embedded knowledge files.
- Map object specs (cone sizes, barrier classes, sign dimensions, TMA vehicle requirements) must be fully enumerated in the skill resources.

### Affected Components
- `server/index.ts` - New API routes.
- `src/App.tsx` - Routing to the new module.
- `server/schema.sql` - Table `ta_plans` already present.

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: L
