import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { BrandingHydrator } from "../BrandingHydrator";

const { mockRehydrate, mockSetHydrated } = vi.hoisted(() => ({
  mockRehydrate: vi.fn(),
  mockSetHydrated: vi.fn(),
}));

vi.mock("@/store/brandingStore", () => ({
  useBrandingStore: Object.assign(
    vi.fn(() => undefined),
    {
      persist: { rehydrate: mockRehydrate },
      getState: () => ({ setHydrated: mockSetHydrated }),
    }
  ),
}));

describe("BrandingHydrator", () => {
  it("renders nothing and triggers store rehydration on mount", () => {
    const { container } = render(<BrandingHydrator />);
    expect(container.firstChild).toBeNull();
    expect(mockRehydrate).toHaveBeenCalledOnce();
    expect(mockSetHydrated).toHaveBeenCalledWith(true);
  });
});
