> **Platform**: Codex | **Skill**: wow_frontend_dev | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_frontend_dev

## Architecture & Core Tech Stack
- **Framework:** React 19 + Vite.
- **Routing:** `react-router-dom` v6 (`src/App.tsx`).
- **Styling:** Tailwind CSS (utility-first, predominantly inline). No separate CSS files unless absolutely necessary.
- **Icons:** `lucide-react` (e.g., `<Save size={16} className="text-white" />`).
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`) and Context Providers (`src/contexts/`, `src/context/`).

## 1. UI Layouts & Surfaces (WOW-012)
The application has multiple "surfaces" or views:
- **Simple Mode (`src/pages/SimplePage.tsx`):** The primary view for workers and site managers.
  - Controlled via `src/components/simple/SimpleApp.tsx`.
  - Uses `SimpleNavRail` (desktop) and `SimpleMobileTabBar` (mobile) for navigation.
  - Active tab state drives content rendering (e.g., `activeTab === "taplanner" ? <TAPlannerPage /> : null`).
- **Technical Mode (`src/pages/TechnicalPage`):** Advanced IDE-like view with Explorer, Search, and Terminal.
- **Admin/Portal Views:** `AdminDashboard`, `WorkerPortal`, `ClientDashboard`.

## 2. Styling & Aesthetics
The application uses a strict Dark Theme by default.
- **Backgrounds:** 
  - Main app/panels: `#1e1e1e`
  - Cards/Modals/Sidebar: `#252526`
  - Input/Secondary: `#333333`
- **Borders:** `#3c3c3c` or `#454545`.
- **Text:** 
  - Primary: `text-white` or `#cccccc`
  - Muted/Labels: `#858585`
- **Accents:** 
  - Primary Brand: `#ea580c` (Orange), hover `#d94e06`
  - Success/Valid: `#238636` or `emerald-400`
  - Warning/Pending: `amber-400`
  - Danger/Error: `#f14c4c` or `red-400`
- **Typography:** Use `tracking-tight` for headers. Inputs and buttons usually `text-sm` or `text-[13px]`.

## 3. Internationalization (i18n) (WOW-014)
**CRITICAL:** NEVER hardcode user-facing text in the UI.
1. Use the translation hook: `import { useTranslation } from "../contexts/LanguageContext";`
2. Fetch strings: `const { t } = useTranslation();`
3. Render: `<button>{t("common.save")}</button>`
4. Maintain dictionaries: Add new keys to **both** `src/i18n/sv.json` (Swedish) and `src/i18n/en.json` (English).

## 4. API Communication
- Use standard `fetch` API.
- Always include the JWT token: 
  ```javascript
  const res = await fetch("/api/endpoint", {
    headers: { 'Authorization': `Bearer ${localStorage.getItem("wop_token")}` }
  });
  ```
- Gracefully handle errors and display them (e.g., in a red banner with an `AlertTriangle` icon).

## 5. Component Development Guidelines
- Use functional components.
- Prop interface above the component definition.
- Decompose large views into smaller components (e.g., `TAPlannerPage` -> `TAPlanningWizard` -> `SketchLibrary`).
- Use Lucide icons to enhance visual hierarchy.
