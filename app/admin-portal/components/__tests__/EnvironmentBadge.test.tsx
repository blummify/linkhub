import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnvironmentBadge } from "../EnvironmentBadge";

describe("EnvironmentBadge", () => {
  it("renders the production label with the production (green) variant", () => {
    render(<EnvironmentBadge env={{ name: "production", label: "Production" }} />);
    const badge = screen.getByText("Production");
    expect(badge).toHaveClass("text-green-500");
  });

  it("renders a non-production environment with a visibly different variant", () => {
    render(<EnvironmentBadge env={{ name: "staging", label: "Staging" }} />);
    const badge = screen.getByText("Staging");
    expect(badge).toHaveClass("text-amber-500");
    expect(badge).not.toHaveClass("text-green-500");
  });

  it("uses the configured label text", () => {
    render(<EnvironmentBadge env={{ name: "development", label: "Local dev" }} />);
    expect(screen.getByText("Local dev")).toHaveClass("text-rose-500");
  });
});
