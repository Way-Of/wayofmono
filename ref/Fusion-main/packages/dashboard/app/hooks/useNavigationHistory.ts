import { useCallback, useEffect, useRef } from "react";

/**
 * A navigation entry on the back-navigation stack.
 *
 * - `modal` entries wrap a close callback for dismissing a modal.
 * - `view` entries wrap a revert callback for restoring a previous view.
 *
 * All callbacks MUST be idempotent — safe to call multiple times even if the
 * underlying state has already changed (e.g., calling `setDetailTask(null)`
 * when `detailTask` is already `null`). This handles edge cases where an
 * auto-close side effect fires before a `popstate` event.
 */
export type NavEntry =
  | { type: "modal"; close: () => void }
  | { type: "view"; revert: () => void };

export interface UseNavigationHistoryOptions {
  /** Only active on mobile. When false, pushNav/replaceCurrent are no-ops. */
  enabled: boolean;
}

export interface UseNavigationHistoryResult {
  /** Push a navigation entry onto the stack and call history.pushState. */
  pushNav: (entry: NavEntry) => void;
  /** Replace the top-of-stack entry and call history.replaceState. */
  replaceCurrent: (entry: NavEntry) => void;
}

/**
 * Centralized back-navigation hook that integrates the browser History API
 * (`pushState`/`popstate`) with modal and view state machines.
 *
 * Every modal open and view change pushes a history entry so that the
 * browser back button dismisses the top modal or reverts to the previous
 * view. Works on both desktop and mobile.
 *
 * When `enabled` is false, all operations are no-ops and no `popstate`
 * listener is registered.
 */
export function useNavigationHistory(
  options: UseNavigationHistoryOptions,
): UseNavigationHistoryResult {
  const { enabled } = options;

  // Internal navigation stack. Each entry corresponds to one history entry.
  const stackRef = useRef<NavEntry[]>([]);

  // Guard flag: when popstate fires and calls a close/revert callback, the
  // resulting state change (e.g. `setDetailTask(null)`) must NOT re-push a
  // history entry. pushNav checks this flag and skips if true.
  const isPoppingRef = useRef(false);

  // Keep enabled in a ref so the popstate handler can read the current value
  // without needing to be re-registered on every change.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const pushNav = useCallback(
    (entry: NavEntry) => {
      if (!enabledRef.current) return;

      // Prevent re-push during pop handling
      if (isPoppingRef.current) return;

      // Guard against duplicate consecutive pushes (rapid taps)
      const top = stackRef.current[stackRef.current.length - 1];
      if (top) {
        const topCallback = top.type === "modal" ? top.close : top.revert;
        const newCallback = entry.type === "modal" ? entry.close : entry.revert;
        if (topCallback === newCallback) return;
      }

      stackRef.current.push(entry);

      // Preserve existing history.state properties (e.g. from useDeepLink)
      // while adding our navIndex.
      const navIndex = stackRef.current.length;
      const existingState =
        typeof window !== "undefined" && window.history.state
          ? window.history.state
          : {};
      window.history.pushState({ ...existingState, navIndex }, "");
    },
    [], // stable — reads from refs
  );

  const replaceCurrent = useCallback(
    (entry: NavEntry) => {
      if (!enabledRef.current) return;
      if (stackRef.current.length === 0) return;

      stackRef.current[stackRef.current.length - 1] = entry;

      // Preserve existing history.state properties while updating navIndex
      const navIndex = stackRef.current.length;
      const existingState =
        typeof window !== "undefined" && window.history.state
          ? window.history.state
          : {};
      window.history.replaceState({ ...existingState, navIndex }, "");
    },
    [], // stable — reads from refs
  );

  // Register popstate listener. Always registers in browser environments but
  // the handler checks enabledRef.current to skip when disabled (desktop).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      if (!enabledRef.current) return;

      const targetIndex = event.state?.navIndex ?? 0;
      const currentLength = stackRef.current.length;

      if (targetIndex >= currentLength) return;

      // Calculate how many entries were popped
      const poppedCount = currentLength - targetIndex;

      if (poppedCount <= 0) return;

      isPoppingRef.current = true;

      try {
        // Pop entries in reverse order (top of stack first)
        for (let i = 0; i < poppedCount; i++) {
          const entry = stackRef.current.pop();
          if (entry) {
            if (entry.type === "modal") {
              entry.close();
            } else {
              entry.revert();
            }
          }
        }
      } finally {
        isPoppingRef.current = false;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { pushNav, replaceCurrent };
}
