# WOW-097 — Docs File Tree & Preview Fixes

## Problem
Docs-vyn (`DocsApp.tsx`) har flera kritiska problem som gör att filträdet och preview inte fungerar korrekt:

### 1. Mock data i FileExplorer (`useFileExplorer.ts:13-42`)
Hooken `useFileExplorer` använder hårdkodad mockdata (`mockFiles`) istället för att ladda från workspace API:et. Filträdet som används i `DocsApp` kommer från `RefactorContext` → `tree.nodes`, INTE från `useFileExplorer` — så den hooken är död kod som inte används. Förvirrande och kan orsaka buggar om någon försöker använda den.

### 2. Crash i Spreadsheet preview (`SpreadsheetTable.tsx:7`)
`atob(base64Data)` kraschar med `InvalidCharacterError` när `base64Data` innehåller whitespace eller är felaktigt formaterad. Detta händer när en `.xlsx`-fil med base64-content som innehåller newlines/mellanslag försöker visas.

### 3. Type-mismatch PreviewContent props (`DocsApp.tsx:430-436` vs `PreviewContent.tsx:8-14`)
`DocsApp` skickar `content={selectedContent}` (typ `string | null`) men `PreviewContent` förväntar sig `fileUrl: string`. Detta är en TypeScript-mismatch som orsakar att antikverad eller fel data skickas till preview-komponenten.

### 4. Filträdet visar inte projekt-struktur
Filträdet (`docsNodes` i `DocsApp.tsx:110-123`) filtrerar bara på filändelser men tar inte hänsyn till projekt-struktur. För en mång-tenant-miljö med flera projekt borde trädet visa:
```
📁 Projekt A/
  ├── dokument/
  ├── ritningar/
  └── rapporter/
📁 Projekt B/
  └── ...
```

Just nu visas bara en platt lista av workspace-filer filtrerade på dokumentändelser, utan projekt-uppdelning.

### 5. PreviewContent saknar `content` prop i interface
`PreviewContentProps`-interfacet har `fileUrl: string` men användaren försöker skicka `content`. Komponenten anropar `useFileEditor(file?.path ?? null)` internt för att hämta content — den behöver inte `content` som prop, men anropet från `DocsApp` försöker ändå skicka det.

## Desired Outcome
- Filträdet visar workspace-filer organiserade per projekt-hierarki
- Preview fungerar för alla dokumenttyper (spreadsheets, PDF, markdown, bilder) utan crash
- Inga TypeScript-errors i Docs komponenterna
- `useFileExplorer`-hooken antingen används korrekt eller städas bort
- Spreadsheet preview tolkar base64-data defensivt

## Scope
### P0 — Crash/stability ✅ DONE
- [x] Fix `SpreadsheetTable.tsx:7` — defensive atob med try/catch + whitespace-rensning
- [x] Fix `PreviewContent` props — lade till markdown/text-rendering, gjorde `fileUrl`/`zoom`/`currentPage` optional
- [x] Fix `PreviewModal.tsx` — bytte default import till named import
- [x] Fix chat höjd — bytte `position: fixed` till flex-baserad layout i `DocumentChatPanel.css`
- [x] Fix `DocsApp.tsx` ChatRow-type mismatch — korrekt mapping av `timestamp`, `type`, `author`
- [x] Fix `WopShellApi.openNativeApp` — lade till saknad typ i `vite-env.d.ts`

### P1 — File tree visar projekt-struktur
- [ ] Undersök om workspace API returnerar projekt-mappad trädstruktur eller bara ett platt filsystem
- [ ] Implementera projekt-aware grouping i `docsNodes`-filtret (gruppera filer under projektmappar)
- [ ] Uppdatera `FileExplorer` att visa projekt-headers om tillgängligt
- [ ] Säkerställ att tenant-scopade workspaces (`workspace/<tenantId>/`) används för att ladda trädet

### P2 — Rensa död kod
- [ ] `useFileExplorer.ts` — antingen koppla ihop med riktig API eller ta bort mock-data och markera som deprecated
- [ ] Dokumentera vilken hook som faktiskt används för filträdet (RefactorContext ↔ tree.nodes)

## Acceptance Criteria
- [x] `bun run build` passes (zero TS errors)
- [ ] Klicka på en `.xlsx`-fil i filtree't → preview visas utan crash
- [x] Klicka på `.md`/`.txt` → innehållet renderas som markdown/text (via MarkdownPreviewPane)
- [ ] Klicka på `.pdf` → PDF visas i iframe
- [ ] Klicka på bild → bild visas
- [ ] Filträdet är organiserat per projekt (eller åtminstone per workspace-mapp)
- [x] Inga TS-errors i DocsApp, PreviewContent, SpreadsheetTable
- [x] Chat-panelen är inte längre `position: fixed` — följer flex-layouten korrekt
- [x] Drag-handle mellan preview och chat fungerar (DockSplitHandle anropar setChatWidth)

## Files to Change
- `src/components/documenthandler/SpreadsheetTable.tsx` — fix atob crash (P0)
- `src/components/documenthandler/PreviewContent.tsx` — fix props interface (P0)
- `src/components/docs/DocsApp.tsx` — fix prop-passing, base64 rensning (P0), project-aware tree (P1)
- `src/components/documenthandler/hooks/useFileExplorer.ts` — städa mock data (P2)
- `src/components/documenthandler/FileExplorer.tsx` — ev. UI-uppdateringar för projekt-hierarki (P1)
- `server/routes/file-system.ts` — verify workspace API returns tenant-scoped tree (ref WOW-063)
- `server/routes/workspace.ts` — verify workspace routes pass tenantId (ref WOW-063)

## Related Tickets
- **WOW-023** (Docs-page) — Original docs page ticket, extension added native dialogs
- **WOW-063** (tenant-data-isolation) — Workspace/tenant isolation upstream
- **WOW-088** (digital-project-folders) — Related: project folder structure in workspace
- **WOW-069** (open-dwg-files) — DWG preview extension

---

**Created**: 2026-06-07
**Priority**: High
**Estimated Effort**: M
**Depends on**: WOW-063 (tenant-isolated workspace paths)
**Related**: WOW-023, WOW-088, WOW-069
