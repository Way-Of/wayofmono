# UI Patterns and Best Practices for Way of Work (WoW)

This document outlines common UI patterns and best practices for developing components within the Way of Work platform, ensuring consistency and user experience across different modules.

## 1. Dark Theme Adherence

All UI components must adhere to the WoW dark theme.
- **Backgrounds**: Use `#1e1e1e` for main app/panels, `#252526` for cards/modals/sidebars, and `#333333` for input/secondary elements.
- **Borders**: `#3c3c3c` or `#454545`.
- **Text**: `text-white` or `#cccccc` for primary text; `#858585` for muted/labels.
- **Accents**: Use primary brand color `#ea580c` (orange) for interactive elements, `emerald-400` for success, `amber-400` for warning, and `red-400` for danger/error.

## 2. Component Structure

- **Functional Components**: Prefer functional React components.
- **Prop Interfaces**: Define TypeScript interfaces for component props above the component definition.
- **Decomposition**: Break down large views into smaller, reusable components.

## 3. Styling with Tailwind CSS

- **Utility-First**: Leverage Tailwind CSS utility classes extensively.
- **No Separate CSS**: Avoid creating separate CSS files unless absolutely necessary for complex, custom styles that cannot be achieved with Tailwind.

## 4. Icons

- **Lucide React**: Use `lucide-react` for all icons (e.g., `<Save size={16} className="text-white" />`).

## 5. Data Display Patterns

### Tables
- Use `<table>` elements with `<thead>` and `<tbody>`.
- Apply `w-full` for full width.
- `text-left text-[#999]` for table headers.
- `divide-y divide-[#3c3c3c]` for body rows.
- Use `text-sm` or `text-[13px]` for text size.

### Cards
- `bg-[#252526]` for background.
- `rounded` for border radius.
- `border border-[#3c3c3c]` for borders.
- Consistent padding (e.g., `p-4`).

## 6. Forms and Inputs

- **Input Styling**: `bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-sm`.
- **Buttons**:
    - Primary: `bg-[#ea580c] hover:bg-[#d45309] rounded text-white text-sm`.
    - Secondary/Cancel: `bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded text-sm`.

## 7. Internationalization (i18n)

- **Do not hardcode text**: Always use the `useTranslation()` hook for user-facing text.
- **Translation Keys**: Ensure all keys exist in both `src/i18n/sv.json` and `src/i18n/en.json`.
