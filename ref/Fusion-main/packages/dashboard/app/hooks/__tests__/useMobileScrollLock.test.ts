import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _resetLockState, useMobileScrollLock } from "../useMobileScrollLock";

describe("useMobileScrollLock", () => {
  let savedInnerWidth: number;
  let savedMaxTouchPoints: number;
  let savedOntouchstart: typeof window.ontouchstart;
  let scrollSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    _resetLockState();
    savedInnerWidth = window.innerWidth;
    savedMaxTouchPoints = navigator.maxTouchPoints;
    savedOntouchstart = window.ontouchstart;
    document.documentElement.style.cssText = "";
    document.body.style.cssText = "";
    scrollSpy = vi.fn();
    window.scrollTo = scrollSpy as unknown as typeof window.scrollTo;
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: savedInnerWidth, writable: true, configurable: true });
    Object.defineProperty(navigator, "maxTouchPoints", { value: savedMaxTouchPoints, configurable: true });
    Object.defineProperty(window, "ontouchstart", { value: savedOntouchstart, writable: true, configurable: true });
    document.documentElement.style.cssText = "";
    document.body.style.cssText = "";
    _resetLockState();
  });

  function makeMobile() {
    (window as unknown as { ontouchstart: unknown }).ontouchstart = null;
    Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true, configurable: true });
  }

  function makeDesktop() {
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 1280, writable: true, configurable: true });
  }

  it("pins body with position:fixed and overflow:hidden on mobile when enabled", () => {
    makeMobile();
    Object.defineProperty(window, "scrollY", { value: 120, writable: true, configurable: true });
    renderHook(() => useMobileScrollLock(true));
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-120px");
    expect(document.body.style.width).toBe("100%");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("does nothing on desktop", () => {
    makeDesktop();
    renderHook(() => useMobileScrollLock(true));
    expect(document.body.style.position).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("restores prior styles and scroll position on cleanup", () => {
    makeMobile();
    document.body.style.position = "relative";
    document.body.style.top = "5px";
    Object.defineProperty(window, "scrollY", { value: 240, writable: true, configurable: true });

    const { unmount } = renderHook(() => useMobileScrollLock(true));
    unmount();

    expect(document.body.style.position).toBe("relative");
    expect(document.body.style.top).toBe("5px");
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    // Always snap to 0 on release — see hook source for rationale.
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it("does not lock when disabled", () => {
    makeMobile();
    renderHook(() => useMobileScrollLock(false));
    expect(document.body.style.position).toBe("");
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("reference-counts so an inner unmount does not release an outer lock", () => {
    makeMobile();
    Object.defineProperty(window, "scrollY", { value: 80, writable: true, configurable: true });

    const outer = renderHook(() => useMobileScrollLock(true));
    const inner = renderHook(() => useMobileScrollLock(true));
    expect(document.body.style.position).toBe("fixed");

    inner.unmount();
    expect(document.body.style.position).toBe("fixed");
    expect(scrollSpy).not.toHaveBeenCalled();

    outer.unmount();
    expect(document.body.style.position).toBe("");
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
