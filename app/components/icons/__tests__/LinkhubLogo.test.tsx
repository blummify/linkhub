import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinkhubLogo } from "../LinkhubLogo";

describe("LinkhubLogo", () => {
  it("renders the linkhub wordmark", () => {
    render(<LinkhubLogo />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
  });

  it("renders chain-ring SVG mark", () => {
    const { container } = render(<LinkhubLogo />);
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("renders markOnly without the wordmark", () => {
    render(<LinkhubLogo markOnly />);
    expect(screen.queryByText("linkhub")).not.toBeInTheDocument();
  });

  it("accepts sm, md, and lg size variants without error", () => {
    const { rerender } = render(<LinkhubLogo size="sm" />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
    rerender(<LinkhubLogo size="md" />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
    rerender(<LinkhubLogo size="lg" />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
  });
});
