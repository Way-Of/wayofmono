import { useEffect } from "react";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth <= 768;
  return hasTouchScreen && isNarrow;
}

/**
 * Reference-counted body scroll lock for fullscreen mobile overlays.
 *
 * Uses the `position: fixed; top: -scrollY` pattern (the same approach used
 * by Bootstrap, Headless UI, and Stripe Elements) instead of just
 * `overflow: hidden`. The reason: iOS Safari ignores `overflow: hidden` when
 * an input inside a `position: fixed` overlay is focused — it scrolls the
 * document to bring the caret above the soft keyboard, and after dismissal
 * the document can be left scrolled with `visualViewport.offsetTop > 0`,
 * shoving the underlying dashboard (header included) off the top of the
 * screen with a matching gap at the bottom.
 *
 * Pinning `body` with `position: fixed` makes the document genuinely
 * unscrollable, so iOS has nothing to do on focus and leaves the visible
 * area aligned with the layout viewport.
 *
 * Reference counting matters because multiple overlays can be open at once
 * (e.g. a confirm dialog over a TodoModal) — only the outermost lock should
 * actually mutate styles, so an inner unmount doesn't release the lock for
 * an outer overlay that is still open.
 */
let lockCount = 0;
let savedStyles: {
  htmlOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  scrollY: number;
} | null = null;

function applyLock(): void {
  if (typeof window === "undefined") return;
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }
  const html = document.documentElement;
  const body = document.body;
  savedStyles = {
    htmlOverflow: html.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverflow: body.style.overflow,
    scrollY: window.scrollY,
  };
  html.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedStyles.scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  lockCount = 1;
}

function releaseLock(): void {
  if (typeof window === "undefined") return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0 || !savedStyles) return;
  const html = document.documentElement;
  const body = document.body;
  const { htmlOverflow, bodyPosition, bodyTop, bodyLeft, bodyRight, bodyWidth, bodyOverflow, scrollY } = savedStyles;
  html.style.overflow = htmlOverflow;
  body.style.position = bodyPosition;
  body.style.top = bodyTop;
  body.style.left = bodyLeft;
  body.style.right = bodyRight;
  body.style.width = bodyWidth;
  body.style.overflow = bodyOverflow;
  savedStyles = null;
  // Always snap back to the top, not to the captured `scrollY`. The
  // captured value is only meaningful if the lock was applied before iOS
  // had a chance to forcibly scroll the document (e.g. modal open with
  // no focused input). For App-level activation triggered by an input
  // gaining focus, iOS may have already scrolled the document by the
  // time the lock effect runs — capturing that already-shifted scrollY
  // and restoring to it would leave the dashboard pushed up after the
  // keyboard dismisses (the original bug). The dashboard's base layout
  // has `body { overflow: hidden }` so user-initiated scroll position
  // is always 0 anyway.
  window.scrollTo(0, 0);
  void scrollY;
}

/** Test-only: reset the module-level lock state. */
export function _resetLockState(): void {
  lockCount = 0;
  savedStyles = null;
}

/**
 * Lock body scroll and pin position while a fullscreen mobile overlay is
 * open. Recovers iOS visualViewport drift on cleanup. No-op on desktop.
 */
export function useMobileScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;
    applyLock();
    return () => {
      releaseLock();
    };
  }, [enabled]);
}
