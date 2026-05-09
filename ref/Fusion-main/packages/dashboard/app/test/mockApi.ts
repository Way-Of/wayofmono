/**
 * Canonical dashboard app API mock helper.
 *
 * Add new `app/api.ts` or `app/api/legacy.ts` exports here first before
 * introducing ad-hoc per-test `vi.mock("../../api", …)` export lists.
 *
 * Behavior contract:
 * - preserve real exports by default
 * - apply canonical/common test mocks
 * - allow per-suite overrides
 * - auto-synthesize stable fallback fns for missing callable exports
 */
import { vi, type Mock } from "vitest";

type AnyFn = Mock;
type AnyModule = Record<string, unknown>;

const fallbackFns = new Map<string, AnyFn>();

function getFallback(name: string): AnyFn {
  if (!fallbackFns.has(name)) {
    fallbackFns.set(name, vi.fn(async () => undefined));
  }
  return fallbackFns.get(name)!;
}

export const dashboardApiMocks = {
  fetchTasks: vi.fn(async () => []),
  fetchSettings: vi.fn(async () => ({})),
  updateSettings: vi.fn(async () => ({})),
  fetchGlobalSettings: vi.fn(async () => ({})),
  fetchAuthStatus: vi.fn(async () => ({ providers: [] })),
  fetchModels: vi.fn(async () => ({ models: [], favoriteProviders: [], favoriteModels: [] })),
  fetchTaskDetail: vi.fn(),
  fetchTaskReview: vi.fn(),
  fetchUnreadCount: vi.fn(async () => ({ unreadCount: 0 })),
} satisfies Record<string, AnyFn>;

export async function createDashboardApiMock(
  importActual: () => Promise<AnyModule>,
  overrides: Record<string, AnyFn> = {},
): Promise<AnyModule> {
  const actual = await importActual();
  const mocked: AnyModule = { ...actual, ...dashboardApiMocks, ...overrides };

  return new Proxy(mocked, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") return Reflect.get(target, prop, receiver);
      if (Reflect.has(target, prop)) return Reflect.get(target, prop, receiver);

      if (["then", "catch", "finally"].includes(prop)) {
        return undefined;
      }
      const actualValue = (actual as AnyModule)[prop];
      if (typeof actualValue === "function" || actualValue === undefined) {
        const fn = getFallback(prop);
        (target as AnyModule)[prop] = fn;
        return fn;
      }
      return actualValue;
    },
  });
}

export function resetDashboardApiMockState(): void {
  Object.values(dashboardApiMocks).forEach((fn) => fn.mockReset());
  for (const fn of fallbackFns.values()) fn.mockReset();
}
