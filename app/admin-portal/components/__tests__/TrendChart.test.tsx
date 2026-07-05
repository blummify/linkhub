import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TrendChart } from "../TrendChart";

describe("TrendChart", () => {
  it("renders a line path for each series", () => {
    const { container } = render(
      <TrendChart signups={[170, 160, 140, 80]} revenue={[185, 180, 168, 118]} />
    );
    const paths = container.querySelectorAll("path");
    // One area + two lines.
    expect(paths.length).toBe(3);
    expect(paths[0].getAttribute("d")).toContain("Z");
  });
});
