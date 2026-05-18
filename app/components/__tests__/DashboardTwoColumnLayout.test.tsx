import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardTwoColumnLayout } from "../DashboardTwoColumnLayout";

describe("DashboardTwoColumnLayout", () => {
  it("renders left slot content", () => {
    render(
      <DashboardTwoColumnLayout
        left={<div>Left content</div>}
        preview={<div>Preview</div>}
      />
    );
    expect(screen.getByText("Left content")).toBeInTheDocument();
  });

  it("renders preview slot content", () => {
    render(
      <DashboardTwoColumnLayout
        left={<div>Left</div>}
        preview={<div>Preview content</div>}
      />
    );
    expect(screen.getByText("Preview content")).toBeInTheDocument();
  });

  it("applies custom className to the root element", () => {
    const { container } = render(
      <DashboardTwoColumnLayout
        left={<div />}
        preview={<div />}
        className="custom-layout"
      />
    );
    expect(container.firstChild).toHaveClass("custom-layout");
  });
});
