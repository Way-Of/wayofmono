import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import { COLOR_THEMES, type ThemeMode, type ColorTheme } from "@fusion/core";
import { fetchGlobalSettings, updateGlobalSettings } from "../api";

const THEME_MODE_STORAGE_KEY = "kb-dashboard-theme-mode";
const COLOR_THEME_STORAGE_KEY = "kb-dashboard-color-theme";
const FONT_SCALE_STORAGE_KEY = "kb-dashboard-font-scale-pct";
const DEFAULT_FONT_SCALE_PCT = 100;
const MIN_FONT_SCALE_PCT = 85;
const MAX_FONT_SCALE_PCT = 125;
const VALID_COLOR_THEMES = [...COLOR_THEMES] satisfies ColorTheme[];
const THEME_DATA_ID = "theme-data";
const THEME_DATA_FILENAME = "theme-data.css";

/**
 * Get the resolved URL for theme-data.css.
 *
 * This function handles both HTTP/HTTPS origins and Electron file:// contexts.
 * Using document.baseURI ensures the stylesheet path resolves correctly regardless
 * of whether the app is served over HTTP or loaded from a file:// URL.
 *
 * For file:// URLs, the path is derived relative to the HTML file's directory.
 * For HTTP/HTTPS URLs, the path is derived relative to the HTML file's directory
 * (same as file://) to ensure correct resolution in nested deployments.
 */
function getThemeDataUrl(): string {
  // Get base URL from document.baseURI (most reliable across contexts)
  // Falls back to document.location.href if baseURI is unavailable
  const base = document.baseURI || (typeof document.location !== "undefined" ? document.location.href : "");

  if (!base) {
    // Fallback to absolute path if no base available
    return `/${THEME_DATA_FILENAME}`;
  }

  // Derive path relative to HTML file directory
  // Handle two cases:
  // 1. Base ends with "/" (directory path): replace trailing "/" with "/filename"
  // 2. Base ends with filename: replace filename with "/filename"
  if (base.endsWith("/")) {
    // Directory path: replace trailing "/" with "/theme-data.css"
    return base.slice(0, -1) + `/${THEME_DATA_FILENAME}`;
  } else {
    // Filename path: replace last segment with "/theme-data.css"
    return base.replace(/\/[^/]+$/, `/${THEME_DATA_FILENAME}`);
  }
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Use useLayoutEffect on client, useEffect on server (no-op)
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

interface UseThemeReturn {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  dashboardFontScalePct: number;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setDashboardFontScalePct: (scalePct: number) => void;
  isSystemDark: boolean;
}

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light" || value === "system";
}

function readCachedThemeMode(): ThemeMode {
  if (!isBrowser) return "dark";
  try {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (isValidThemeMode(saved)) {
      return saved;
    }
  } catch {
    // localStorage not available, use default
  }
  return "dark";
}

function readCachedColorTheme(): ColorTheme {
  if (!isBrowser) return "default";
  try {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    if (saved && VALID_COLOR_THEMES.includes(saved as ColorTheme)) {
      return saved as ColorTheme;
    }
  } catch {
    // localStorage not available, use default
  }
  return "default";
}

function writeCachedThemeMode(mode: ThemeMode): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {
    // localStorage not available, skip cache write
  }
}

function writeCachedColorTheme(theme: ColorTheme): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage not available, skip cache write
  }
}

function normalizeFontScalePct(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_FONT_SCALE_PCT;
  }
  return Math.min(MAX_FONT_SCALE_PCT, Math.max(MIN_FONT_SCALE_PCT, Math.round(value)));
}

function readCachedDashboardFontScalePct(): number {
  if (!isBrowser) return DEFAULT_FONT_SCALE_PCT;
  try {
    const saved = Number(localStorage.getItem(FONT_SCALE_STORAGE_KEY));
    return normalizeFontScalePct(saved);
  } catch {
    return DEFAULT_FONT_SCALE_PCT;
  }
}

function writeCachedDashboardFontScalePct(scalePct: number): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(normalizeFontScalePct(scalePct)));
  } catch {
    // localStorage not available, skip cache write
  }
}

/**
 * Get the effective theme mode (resolves "system" to actual dark/light value)
 */
function getEffectiveThemeMode(mode: ThemeMode, systemIsDark: boolean): "dark" | "light" {
  if (mode === "system") {
    return systemIsDark ? "dark" : "light";
  }
  return mode;
}

/**
 * Apply theme attributes to document.documentElement
 * Call this immediately to prevent flash of wrong theme
 */
function applyThemeAttributes(
  themeMode: ThemeMode,
  colorTheme: ColorTheme,
  dashboardFontScalePct: number,
  systemIsDark: boolean,
): void {
  if (!isBrowser) return;

  const effectiveMode = getEffectiveThemeMode(themeMode, systemIsDark);
  document.documentElement.setAttribute("data-theme", effectiveMode);
  document.documentElement.setAttribute("data-color-theme", colorTheme);
  document.documentElement.style.fontSize = `${normalizeFontScalePct(dashboardFontScalePct)}%`;
}

/**
 * Load theme-data.css for non-default themes.
 * Safely handles existing links by checking href and updating if stale.
 * After href reconciliation, existing links are moved to the end of <head>
 * to ensure color-theme CSS rules take precedence over base token
 * redefinitions in subsequent stylesheets (CSS cascade correctness).
 *
 * This is critical for dark mode: if #theme-data is injected early by
 * pre-hydration scripts but styles.css loads later and redefines base
 * tokens, those redefinitions win the cascade unless theme-data is
 * repositioned to come after them.
 */
function loadThemeDataStylesheet(): void {
  if (!isBrowser) return;

  const expectedHref = getThemeDataUrl();
  const existingLink = document.getElementById(THEME_DATA_ID) as HTMLLinkElement | null;

  if (existingLink) {
    // Link exists - update href if it differs from expected (handles baseURI changes)
    if (existingLink.href !== expectedHref) {
      existingLink.href = expectedHref;
    }
    // Move existing link to end of <head> for CSS cascade correctness.
    // This ensures color-theme rules (which use [data-color-theme="..."] selectors)
    // are evaluated AFTER any subsequent stylesheets that might redefine base tokens.
    // Without this, dark color themes can appear broken because base token
    // redefinitions win the cascade over color-theme rules.
    if (existingLink.parentNode === document.head && document.head.lastChild !== existingLink) {
      document.head.appendChild(existingLink);
    }
    return;
  }

  // No existing link - create one
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = expectedHref;
  link.id = THEME_DATA_ID;
  document.head.appendChild(link);
}

/**
 * Unload theme-data.css when returning to default theme.
 */
function unloadThemeDataStylesheet(): void {
  if (!isBrowser) return;
  const existing = document.getElementById(THEME_DATA_ID);
  if (existing) {
    existing.remove();
  }
}

/**
 * Custom hook for theme management.
 *
 * Source of truth: backend global settings (`~/.fusion/settings.json`).
 *
 * Behavior:
 * - Initializes from localStorage cache to avoid pre-hydration theme flash
 * - Hydrates from backend global settings on mount and reconciles cache
 * - Writes through on updates (state + localStorage cache + async backend update)
 */
export function useTheme(): UseThemeReturn {
  // Initialize from localStorage cache or defaults to avoid flash before hydration.
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readCachedThemeMode());
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => readCachedColorTheme());
  const [dashboardFontScalePct, setDashboardFontScalePctState] = useState<number>(() => readCachedDashboardFontScalePct());
  const [isHydrating, setIsHydrating] = useState(true);

  // Track system color scheme preference
  const [isSystemDark, setIsSystemDark] = useState<boolean>(() => {
    if (!isBrowser) return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const themeModeRef = useRef(themeMode);
  const colorThemeRef = useRef(colorTheme);
  const dashboardFontScalePctRef = useRef(dashboardFontScalePct);
  const userSetThemeModeRef = useRef(false);
  const userSetColorThemeRef = useRef(false);
  const userSetDashboardFontScalePctRef = useRef(false);

  useEffect(() => {
    themeModeRef.current = themeMode;
  }, [themeMode]);

  useEffect(() => {
    colorThemeRef.current = colorTheme;
  }, [colorTheme]);

  useEffect(() => {
    dashboardFontScalePctRef.current = dashboardFontScalePct;
  }, [dashboardFontScalePct]);

  // Hydrate canonical theme values from backend global settings.
  useEffect(() => {
    if (!isBrowser || !isHydrating) return;

    let cancelled = false;

    void fetchGlobalSettings()
      .then((globalSettings) => {
        if (cancelled) return;

        // Hydration should not override user-initiated writes that happened while
        // fetchGlobalSettings() was in flight. User selections are authoritative.
        if (isValidThemeMode(globalSettings.themeMode) && !userSetThemeModeRef.current) {
          if (themeModeRef.current !== globalSettings.themeMode) {
            themeModeRef.current = globalSettings.themeMode;
            setThemeModeState(globalSettings.themeMode);
          }
          if (readCachedThemeMode() !== globalSettings.themeMode) {
            writeCachedThemeMode(globalSettings.themeMode);
          }
        }

        if (
          globalSettings.colorTheme
          && VALID_COLOR_THEMES.includes(globalSettings.colorTheme)
          && !userSetColorThemeRef.current
        ) {
          if (colorThemeRef.current !== globalSettings.colorTheme) {
            colorThemeRef.current = globalSettings.colorTheme;
            setColorThemeState(globalSettings.colorTheme);
          }
          if (readCachedColorTheme() !== globalSettings.colorTheme) {
            writeCachedColorTheme(globalSettings.colorTheme);
          }
        }

        if (!userSetDashboardFontScalePctRef.current) {
          const hydratedScalePct = normalizeFontScalePct(globalSettings.dashboardFontScalePct);
          if (dashboardFontScalePctRef.current !== hydratedScalePct) {
            dashboardFontScalePctRef.current = hydratedScalePct;
            setDashboardFontScalePctState(hydratedScalePct);
          }
          if (readCachedDashboardFontScalePct() !== hydratedScalePct) {
            writeCachedDashboardFontScalePct(hydratedScalePct);
          }
        }
      })
      .catch((error) => {
        console.warn("[useTheme] Failed to hydrate theme from global settings", error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrating]);

  // Listen to system color scheme changes
  useEffect(() => {
    if (!isBrowser) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme immediately on mount and when theme changes
  useIsomorphicLayoutEffect(() => {
    applyThemeAttributes(themeMode, colorTheme, dashboardFontScalePct, isSystemDark);
  }, [themeMode, colorTheme, dashboardFontScalePct, isSystemDark]);

  // Ensure theme-data.css is loaded/unloaded based on colorTheme.
  // This handles both initial hydration from backend and runtime theme changes.
  useEffect(() => {
    if (!isBrowser || isHydrating) return;
    if (colorTheme !== "default") {
      loadThemeDataStylesheet();
    } else {
      unloadThemeDataStylesheet();
    }
  }, [colorTheme, isHydrating]);

  // Wrapper setters with write-through persistence.
  const setThemeMode = useCallback((mode: ThemeMode) => {
    // Mark user intent immediately so in-flight hydration cannot overwrite it.
    userSetThemeModeRef.current = true;
    themeModeRef.current = mode;
    setThemeModeState(mode);
    writeCachedThemeMode(mode);

    void updateGlobalSettings({ themeMode: mode }).catch((error) => {
      console.warn("[useTheme] Failed to persist themeMode to global settings", error);
    });
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    // Mark user intent immediately so in-flight hydration cannot overwrite it.
    userSetColorThemeRef.current = true;
    colorThemeRef.current = theme;
    setColorThemeState(theme);
    writeCachedColorTheme(theme);

    // Load or unload theme-data.css based on whether it's a non-default theme
    if (theme !== "default") {
      loadThemeDataStylesheet();
    } else {
      unloadThemeDataStylesheet();
    }

    void updateGlobalSettings({ colorTheme: theme }).catch((error) => {
      console.warn("[useTheme] Failed to persist colorTheme to global settings", error);
    });
  }, []);

  const setDashboardFontScalePct = useCallback((scalePct: number) => {
    const normalizedScalePct = normalizeFontScalePct(scalePct);
    userSetDashboardFontScalePctRef.current = true;
    dashboardFontScalePctRef.current = normalizedScalePct;
    setDashboardFontScalePctState(normalizedScalePct);
    writeCachedDashboardFontScalePct(normalizedScalePct);

    void updateGlobalSettings({ dashboardFontScalePct: normalizedScalePct }).catch((error) => {
      console.warn("[useTheme] Failed to persist dashboardFontScalePct to global settings", error);
    });
  }, []);

  return {
    themeMode,
    colorTheme,
    dashboardFontScalePct,
    setThemeMode,
    setColorTheme,
    setDashboardFontScalePct,
    isSystemDark,
  };
}

/**
 * Utility to apply theme before React hydration.
 *
 * This script intentionally reads from localStorage because it runs synchronously
 * before React boots; localStorage is treated as a backend-synced cache.
 */
export function getThemeInitScript(): string {
  return `
    (function() {
      try {
        var mode = localStorage.getItem('${THEME_MODE_STORAGE_KEY}') || 'dark';
        var colorTheme = localStorage.getItem('${COLOR_THEME_STORAGE_KEY}') || 'default';
        var validThemes = ${JSON.stringify(VALID_COLOR_THEMES)};
        if (!validThemes.includes(colorTheme)) {
          colorTheme = 'default';
        }
        var fontScale = Number(localStorage.getItem('${FONT_SCALE_STORAGE_KEY}') || '${DEFAULT_FONT_SCALE_PCT}');
        if (!Number.isFinite(fontScale)) {
          fontScale = ${DEFAULT_FONT_SCALE_PCT};
        }
        fontScale = Math.min(${MAX_FONT_SCALE_PCT}, Math.max(${MIN_FONT_SCALE_PCT}, Math.round(fontScale)));
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var effectiveMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
        document.documentElement.setAttribute('data-theme', effectiveMode);
        document.documentElement.setAttribute('data-color-theme', colorTheme);
        document.documentElement.style.fontSize = fontScale + '%';
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-color-theme', 'default');
        document.documentElement.style.fontSize = '${DEFAULT_FONT_SCALE_PCT}%';
      }
    })();
  `;
}
