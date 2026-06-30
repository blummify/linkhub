import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("derives an uppercase initial from the name", () => {
    render(<Avatar name="sara addo" />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders explicit content over the initial", () => {
    render(<Avatar name="Quick" content="!" />);
    expect(screen.getByText("!")).toBeInTheDocument();
    expect(screen.queryByText("Q")).not.toBeInTheDocument();
  });

  it("applies the requested tone", () => {
    render(<Avatar name="Nadia" tone="roseSoft" />);
    expect(screen.getByText("N")).toHaveClass("bg-danger-50");
  });

  it("falls back to a placeholder when there is no name", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
