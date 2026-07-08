import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "../Sparkline";

describe("Sparkline", () => {
  it("renders a path for two or more points", () => {
    const { container } = render(<Sparkline values={[1, 5, 2, 8]} />);
    const path = container.querySelector("path");
    expect(path).not.toBeNull();
    expect(path?.getAttribute("d")).toContain("M");
  });

  it("renders nothing for fewer than two points", () => {
    const { container } = render(<Sparkline values={[1]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applies the stroke colour via a utility class", () => {
    const { container } = render(<Sparkline values={[1, 2]} strokeClassName="stroke-green-500" />);
    expect(container.querySelector("path")).toHaveClass("stroke-green-500");
  });
});
