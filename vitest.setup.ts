import "@testing-library/jest-dom";
import "./vitest.d.ts";
import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock("focus-trap-react", () => ({ default: ({ children }: any) => children }));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(60),
  })),
}));
import { createElement } from "react";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock, writable: true });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Reset Zustand stores between tests so state doesn't leak
vi.mock("@/store/linksStore", () => {
  const state = {
    links: [], isLoading: false,
    setLinks: vi.fn(), setLoading: vi.fn(),
    optimisticAdd: vi.fn(), confirmAdd: vi.fn(), revertAdd: vi.fn(),
    optimisticUpdate: vi.fn(), revertUpdate: vi.fn(),
    removeLink: vi.fn(), reorderLinks: vi.fn(),
  };
  const useLinksStore = vi.fn((selector?: (s: unknown) => unknown) =>
    selector ? selector(state) : state
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useLinksStore as any).getState = () => state;
  return { useLinksStore };
});
vi.mock("@/store/brandingStore", () => {
  const state = {
    themeId: "default", displayName: "Your Name", handle: "",
    bio: "", accentColor: "#3b46e0", buttonStyle: "rounded",
    fontFamily: "Instrument Serif", userPickedTheme: false,
    isDirty: false, hydrated: true,
    _baseline: { themeId: "default", displayName: "Your Name", handle: "", bio: "", accentColor: "#3b46e0", buttonStyle: "rounded", fontFamily: "Instrument Serif", userPickedTheme: false },
    setDisplayName: vi.fn(), setHandle: vi.fn(), setBio: vi.fn(),
    setAccentColor: vi.fn(), setButtonStyle: vi.fn(), setFontFamily: vi.fn(),
    selectTheme: vi.fn(), randomTheme: vi.fn(),
    patchState: vi.fn(), syncFromDb: vi.fn(), reset: vi.fn(), markSaved: vi.fn(), setHydrated: vi.fn(),
  };
  const useBrandingStore = vi.fn((selector?: (s: unknown) => unknown) =>
    selector ? selector(state) : state
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useBrandingStore as any).getState = () => state;
  return { useBrandingStore };
});
vi.mock("@/store/sidebarStore", () => ({
  useSidebarStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = { isCollapsed: false, toggle: vi.fn(), setCollapsed: vi.fn() };
    return selector ? selector(state) : state;
  }),
}));
vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      showLinkModal: false, editingLink: null, pendingDelete: null, showPalette: false,
      openAddLink: vi.fn(), openEditLink: vi.fn(), closeLinkModal: vi.fn(),
      setPendingDelete: vi.fn(), openPalette: vi.fn(), closePalette: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));
vi.mock("@/store/profileStore", () => {
  const state = {
    avatarUrl: null, hasClaimedHandle: true, fetched: false,
    setAvatarUrl: vi.fn(), setHasClaimedHandle: vi.fn(), markFetched: vi.fn(),
  };
  const useProfileStore = vi.fn((selector?: (s: unknown) => unknown) =>
    selector ? selector(state) : state
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useProfileStore as any).getState = () => state;
  return { useProfileStore };
});

Element.prototype.scrollIntoView = vi.fn();

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className, style, onError }: any) =>
    createElement("img", { src, alt, width, height, className, style, onError }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className, onClick }: any) =>
    createElement("a", { href, className, onClick }, children),
}));

export const mockRouterPush = vi.fn();
export const mockRouterReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/user-dashboard",
  useSearchParams: () => new URLSearchParams(),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */
