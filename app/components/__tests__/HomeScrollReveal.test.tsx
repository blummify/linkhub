import { describe, expect, it, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { HomeScrollReveal } from "../HomeScrollReveal";

const mockObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
};

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    // Must use function keyword — arrow functions cannot be used as constructors
    vi.fn().mockImplementation(function () {
      return mockObserver;
    })
  );
});

describe("HomeScrollReveal", () => {
  it("renders nothing (returns null)", () => {
    const { container } = render(<HomeScrollReveal />);
    expect(container).toBeEmptyDOMElement();
  });

  it("creates an IntersectionObserver on mount", () => {
    render(<HomeScrollReveal />);
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  it("calls disconnect on unmount", () => {
    mockObserver.disconnect.mockClear();
    const { unmount } = render(<HomeScrollReveal />);
    unmount();
    expect(mockObserver.disconnect).toHaveBeenCalledOnce();
  });
});
