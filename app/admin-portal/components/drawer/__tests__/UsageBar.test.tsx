import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageBar } from "../UsageBar";

describe("UsageBar", () => {
  it("renders the label, display text, and a clamped fill width", () => {
    const { container } = render(
      <UsageBar metric={{ label: "Links", used: 15, limit: 25, display: "15 / 25" }} />
    );
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("15 / 25")).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 60%"]')).not.toBeNull();
  });

  it("never exceeds 100% when usage is over the limit", () => {
    const { container } = render(
      <UsageBar metric={{ label: "Views", used: 200, limit: 100, display: "200 / 100" }} />
    );
    expect(container.querySelector('[style*="width: 100%"]')).not.toBeNull();
  });
});
