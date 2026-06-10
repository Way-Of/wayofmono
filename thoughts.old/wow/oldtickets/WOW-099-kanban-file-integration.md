# WOW-099: Kanban File Integration — Workspace Files + Cards

## Status
🆕 Draft

## Type
🛠 Feature

## Area
- Kanban boards
- File management
- Workspace tree
- Multi-tenancy

## Önskat resultat (Desired Outcome)

All company files i workspace tree (database tree via "DB"-togglen) ska vara fullt integrerade med kanban-kort:

1. **Filer i workspace syns i kort** — När man öppnar ett kanban-kort ska man se alla filer som är kopplade till det kortet, oavsett om de laddades upp via Portal eller via workspace tree
2. **Ladda upp från kort till workspace** — "Attachments"-sektionen i CardView ska ladda upp filer till `workspace/<tenantId>/` (inte blob URLs), så de syns i workspace tree
3. **Card→File länkar persisted** — När en fil kopplas till ett kort ska `workspace_files.kanban_card_id` sättas och `tasks.metadata` uppdateras — båda persisted i SQLite
4. **Board Drive View + Workspace Tree = samma data** — Board Drive View (`/api/portal/files`) och Workspace Tree (`/api/tree/database`) ska visa samma filer
5. **Unified upload** — En endpoint för alla uploads, oavsett om det kommer från kortet eller från file tree
6. **Länkning från båda håll** — Koppla fil→kort från workspace tree (högerklicka → "Link to card") och från kortet ("Attach file from workspace")

## Nuvarande problem

### Problem 1: Card→File länkar är ephemeral
- `card.metadata.fileIds` sparas bara i React state
- Försvinner vid sidladdning eftersom `kanbanService.getAllCardsForBoard()` inte rekonstruerar `fileIds`
- `PUT /api/portal/tasks/:id` sparar metadata men frontend skickar inte `fileIds` till servern

### Problem 2: Två separata upload-system
- `POST /api/fs/upload` → workspace tree (ingen DB-record, ingen card-koppling)
- `POST /api/portal/files/upload` → `workspace/<tenantId>/files/` + DB-record (men tar inte emot `kanban_card_id`)
- CardView attachments → blob URLs (försvinner vid reload)

### Problem 3: Inget sätt att se workspace files från CardView
- CardView har "Link File"-knapp som söker i `workspace_files` men kan inte browsa workspace tree
- Workspace tree har ingen "Link to card"-funktion

## Arkitektur

### Unified Upload (`POST /api/fs/upload` — enhanced)

```typescript
// Request: multipart/form-data
{
  file: File,
  path?: string,           // target directory (default: workspace root)
  kanban_card_id?: string, // optional — link to card immediately
  kanban_board_id?: string // optional — link to board immediately
}
```

På servern:
1. Skriv fil till `workspace/<tenantId>/{path}/{filename}`
2. Om `kanban_card_id` finns: INSERT i `workspace_files` med `kanban_card_id` + `kanban_board_id`
3. Om `kanban_card_id` INTE finns: skapa ändå en `workspace_files`-record (så filen syns i Board Drive View)

### Persisted card→file links

När en fil kopplas till ett kort:
```typescript
// 1. Server: sätt kanban_card_id på workspace_files
await tdb.query(`UPDATE workspace_files SET kanban_card_id = ? WHERE id = ?`)

// 2. Server: uppdatera tasks.metadata med fileIds
await tdb.query(`UPDATE tasks SET metadata = ? WHERE id = ?`)
```

När ett kort laddas:
```typescript
// I GET /api/portal/tasks/:id, inkludera filer:
const files = tdb.query(`SELECT * FROM workspace_files WHERE kanban_card_id = ?`).all(cardId);
```

### CardView attachments → workspace files

Byt från blob URLs till workspace files:
- "Add Attachment" → anropar `POST /api/fs/upload` med `kanban_card_id`
- Visa thumbnail / icon från `GET /api/file?path=...`
- Ta bort → `POST /api/fs/delete` + `UPDATE workspace_files SET kanban_card_id = NULL`

### Workspace tree → "Link to card"

I SimpleFileTree context menu:
- "Link to card…" → öppnar en card-sökare
- Välj kort → `PUT /api/portal/files/:id` med `kanban_card_id`

## Backend Changes

| Fil | Förändring |
|-----|-----------|
| `server/routes/file-system.ts` | Enhance `POST /api/fs/upload`: acceptera `kanban_card_id` + `kanban_board_id`, skapa workspace_files record |
| `server/routes/portal.ts:559-606` | Deprecate eller slå ihop med `/api/fs/upload` |
| `server/routes/portal.ts:643-687` | `PUT /api/portal/tasks/:id`: uppdatera `metadata`-kolumnen med `fileIds` |
| `server/routes/portal.ts` | Ny route: `GET /api/portal/tasks/:id/files` — hämta alla workspace_files för ett kort |
| `server/routes/portal.ts` | Uppdatera `GET /api/portal/tasks` / `GET /api/portal/boards/:id/cards` att inkludera filer i svaret |

## Frontend Changes

| Komponent | Förändring |
|-----------|-----------|
| `src/components/kanban/CardView.tsx` | Byt blobURLs → workspace files; "Attach" → `POST /api/fs/upload` med `kanban_card_id` |
| `src/components/kanban/BoardDriveView.tsx` | Använd `/api/tree/database` som datakälla istället för `/api/portal/files` |
| `src/components/kanban/Kanban.tsx` | Ladda fileIds från server vid board-load |
| `src/services/kanbanService.ts` | Uppdatera `getAllCardsForBoard()` att inkludera fileIds från server |
| `src/services/driveService.ts` | Slå ihop med workspace tree API |
| `src/hooks/useWorkspaceActions.ts` | Lägg till "Link to card" i context menu |
| `src/components/simple/SimpleFileTree.tsx` | Context menu item: "Link to card…" |

## TODO

### P1 — Backend: Unified upload + card linking
- [ ] Enhance `POST /api/fs/upload` att acceptera `kanban_card_id` och `kanban_board_id`
- [ ] När upload kommer med `kanban_card_id`: INSERT i `workspace_files` med kopplingen
- [ ] När upload kommer UTAN `kanban_card_id`: skapa ändå workspace_files record
- [ ] Uppdatera `PUT /api/portal/files/:id` att hantera unlinking (sätt `kanban_card_id = NULL`)
- [ ] Ny route: `GET /api/portal/tasks/:id/files` — returnera workspace_files för kortet
- [ ] Uppdatera `GET /api/portal/boards/:id/cards` att inkludera `fileIds` i varje kort

### P1 — Frontend: CardView workspace files
- [ ] CardView "Attachments" → hämta från `GET /api/portal/tasks/:id/files`
- [ ] CardView "Add Attachment" → `POST /api/fs/upload` med `kanban_card_id`
- [ ] Visa workspace file-thumbnails i CardView attachments
- [ ] "Remove attachment" → unlinking + delete file

### P2 — Frontend: Link file from workspace tree
- [ ] Context menu item: "Link to card…" i SimpleFileTree
- [ ] Card search modal när man klickar "Link to card"
- [ ] Anropa `PUT /api/portal/files/:id` med valt `kanban_card_id`

### P2 — Board Drive View unification
- [ ] BoardDriveView: hämta från workspace tree API istället för portal files API
- [ ] Visa linked cards information i BoardDriveView

## Dependencies
- **Depends on:** WOW-098 (workspace tree, file upload endpoints, DB/local toggle)
- **Depends on:** WOW-063 (multi-tenant workspace paths)
- **Related:** WOW-088 (digital project folders)

## Referenser
- `server/routes/portal.ts:338-360` — `PUT /api/portal/files/:id` (kanban_card_id update)
- `server/routes/portal.ts:559-606` — Nuvarande upload (tar INTE emot kanban_card_id)
- `server/routes/portal.ts:643-687` — `PUT /api/portal/tasks/:id` (metadata kolumn)
- `server/routes/file-system.ts` — `POST /api/fs/upload` (ny upload endpoint)
- `src/components/kanban/CardView.tsx:1455-1591` — CardView attachments (blob URLs)
- `src/services/kanbanService.ts:166-168` — getAllCardsForBoard (tappar fileIds)
- `src/components/kanban/BoardDriveView.tsx` — Portal files view
- `src/services/driveService.ts` — Portal files API client
