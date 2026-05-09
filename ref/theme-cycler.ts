/**
 * Theme Cycler — Simple theme switching
 *
 * Shortcuts:
 *   Ctrl+Alt+U   — Cycle theme forward
 *   Ctrl+Alt+Q   — Cycle theme backward
 *
 * Commands:
 *   /theme          — Open select picker to choose a theme
 *   /theme <name>   — Switch directly by name
 */

import * as fs from 'fs';
import * as path from 'path';

export default function (api: any) {
  function getThemeList(ctx: any) {
    let themes: any[] = [];
    
    // 1. Try to get themes from the UI
    if (ctx.ui && typeof ctx.ui.getAllThemes === 'function') {
      themes = ctx.ui.getAllThemes();
    }

    // 2. If no themes found, scan the local project directory
    if (themes.length === 0) {
      const localThemesPath = path.join(process.cwd(), '.pi', 'themes');
      if (fs.existsSync(localThemesPath)) {
        try {
          const files = fs.readdirSync(localThemesPath);
          themes = files
            .filter(f => f.endsWith('.json'))
            .map(f => ({ name: f.replace('.json', ''), path: path.join(localThemesPath, f) }));
        } catch (e) {
          // Ignore
        }
      }
    }
    
    return themes;
  }

  function findCurrentIndex(ctx: any): number {
    const themes = getThemeList(ctx);
    const current = ctx.ui?.theme?.name;
    return themes.findIndex((t: any) => t.name === current);
  }

  function cycleTheme(ctx: any, direction: 1 | -1) {
    if (!ctx.ui) return;

    const themes = getThemeList(ctx);
    if (themes.length === 0) {
      if (typeof ctx.ui.notify === 'function') {
        ctx.ui.notify("No themes found in pi. Ensure they are in ~/.pi/themes", "warning");
      }
      return;
    }

    let index = findCurrentIndex(ctx);
    if (index === -1) index = 0;

    index = (index + direction + themes.length) % themes.length;
    const theme = themes[index];
    
    try {
      if (typeof ctx.ui.setTheme === 'function') {
        const result = ctx.ui.setTheme(theme.name);
        if (typeof ctx.ui.notify === 'function') {
          if (result && result.success === false) {
             ctx.ui.notify(`Failed to set theme: ${result.error}`, "error");
          } else {
             ctx.ui.notify(`Theme: ${theme.name} (${index + 1}/${themes.length})`, "info");
          }
        }
      }
    } catch (e: any) {
      if (typeof ctx.ui.notify === 'function') {
        ctx.ui.notify(`Error cycling theme: ${e.message}`, "error");
      }
    }
  }

  // --- Shortcuts ---

  if (typeof api.registerShortcut === 'function') {
    api.registerShortcut("shift+x", {
      description: "Cycle theme forward",
      handler: async (ctx: any) => {
        cycleTheme(ctx, 1);
      },
    });
  }

  // --- Command: /theme ---

  if (typeof api.registerCommand === 'function') {
    api.registerCommand("theme", {
      description: "Select a theme: /theme or /theme <name>",
      handler: async (args: string, ctx: any) => {
        if (!ctx.ui) return;

        const themes = getThemeList(ctx);
        const arg = args.trim();

        if (arg) {
          try {
            if (typeof ctx.ui.setTheme === 'function') {
              const result = ctx.ui.setTheme(arg);
              if (result && result.success === false) {
                ctx.ui.notify(`Theme not found: ${arg}`, "error");
              } else {
                ctx.ui.notify(`Theme set to: ${arg}`, "info");
              }
            }
          } catch (e: any) {
            ctx.ui.notify(`Error setting theme: ${e.message}`, "error");
          }
          return;
        }

        const items = themes.map((t: any) => t.name);
        if (items.length === 0) {
          ctx.ui.notify("No themes available", "warning");
          return;
        }

        if (typeof ctx.ui.select === 'function') {
          const selected = await ctx.ui.select("Select Theme", items);
          if (!selected) return;

          try {
            ctx.ui.setTheme(selected);
            ctx.ui.notify(`Theme set to: ${selected}`, "info");
          } catch (e: any) {
            ctx.ui.notify(`Error setting theme: ${e.message}`, "error");
          }
        }
      },
    });
  }
}
