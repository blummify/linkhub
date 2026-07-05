import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "./icons";

describe("Icon", () => {
  it("renders an aria-hidden svg with the given class", () => {
    const { container } = render(<Icon name="search" className="h-4 w-4" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("h-4", "w-4");
  });
});
