import "@testing-library/jest-dom";
import { vi } from "vitest";

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
