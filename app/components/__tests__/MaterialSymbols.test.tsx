import { describe, expect, it, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { MaterialSymbols } from "../MaterialSymbols";

afterEach(() => {
  // Clean up injected link tags between tests
  document.head
    .querySelectorAll("link[href*='Material+Symbols']")
    .forEach((el) => el.remove());
});

describe("MaterialSymbols", () => {
  it("renders null (no DOM output)", () => {
    const { container } = render(<MaterialSymbols />);
    expect(container).toBeEmptyDOMElement();
  });

  it("injects a stylesheet link into document.head", () => {
    render(<MaterialSymbols />);
    const link = document.head.querySelector("link[href*='Material+Symbols']");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("rel")).toBe("stylesheet");
  });

  it("does not inject a duplicate link when the same instance re-renders", () => {
    const { rerender } = render(<MaterialSymbols />);
    rerender(<MaterialSymbols />); // useEffect([]) only runs on mount, not re-render
    const links = document.head.querySelectorAll("link[href*='Material+Symbols']");
    expect(links).toHaveLength(1);
  });
});
