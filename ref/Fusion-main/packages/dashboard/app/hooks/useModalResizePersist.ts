import { useEffect, type RefObject } from "react";

interface PersistedSize {
  width?: number;
  height?: number;
}

/**
 * Persist a resizable modal's user-chosen dimensions across opens.
 *
 * Pair this with `resize: both` in CSS on the modal element. When the user
 * drags the resize grip, the new pixel size is captured via ResizeObserver
 * and stored under `storageKey`. On the next open, the stored size is
 * replayed as inline `width` / `height` styles before the modal becomes
 * interactive.
 *
 * The CSS `min-*` / `max-*` constraints still clamp the applied size at
 * render time, so a value saved on a 4K display won't break the layout
 * when reopened on a laptop.
 *
 * @param ref     ref to the resizable modal element
 * @param isOpen  the modal's open flag — observation only runs while true
 * @param storageKey  localStorage key, must be stable + unique per modal
 */
export function useModalResizePersist(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  storageKey: string,
): void {
  useEffect(() => {
    if (!isOpen) return;
    const node = ref.current;
    if (!node) return;

    // On mobile, modals render full-screen via CSS (height: 100dvh) and the
    // resize grip is disabled. Replaying a desktop-saved pixel height here
    // would override the mobile CSS and leave the modal stuck at a partial
    // height. Skip restoration; also clear any width/height left over from
    // a prior desktop render of the same modal instance.
    const isMobile =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth <= 768;
    if (isMobile) {
      node.style.removeProperty("width");
      node.style.removeProperty("height");
      return;
    }

    // Apply the persisted size on open.
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const { width, height } = JSON.parse(raw) as PersistedSize;
        if (typeof width === "number" && width > 0) node.style.width = `${width}px`;
        if (typeof height === "number" && height > 0) node.style.height = `${height}px`;
      }
    } catch {
      // ignore corrupted entry
    }

    // jsdom (and very old browsers) lacks ResizeObserver — skip persistence
    // gracefully rather than throw. Restoration above still ran.
    if (typeof ResizeObserver === "undefined") return;

    let lastSavedW = node.offsetWidth;
    let lastSavedH = node.offsetHeight;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver(() => {
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      if (w === lastSavedW && h === lastSavedH) return;
      lastSavedW = w;
      lastSavedH = h;
      // Debounce so we don't spam localStorage during the drag.
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ width: w, height: h }));
        } catch {
          // quota / private mode — best-effort
        }
      }, 200);
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [ref, isOpen, storageKey]);
}
