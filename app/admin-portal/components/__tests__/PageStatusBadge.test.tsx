import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageStatusBadge } from "../PageStatusBadge";

describe("PageStatusBadge", () => {
  it("renders the expected label for each page status", () => {
    const { rerender } = render(<PageStatusBadge status="live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Live")).toHaveClass("text-green-500");

    rerender(<PageStatusBadge status="flagged" />);
    expect(screen.getByText("Flagged")).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toHaveClass("text-amber-500");

    rerender(<PageStatusBadge status="suspended" />);
    expect(screen.getByText("Suspended")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toHaveClass("text-rose-500");
  });
});
