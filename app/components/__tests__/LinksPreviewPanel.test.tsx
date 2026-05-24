import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinksPreviewPanel } from "../LinksPreviewPanel";

describe("LinksPreviewPanel", () => {
  it("renders children centered in a column", () => {
    const { container } = render(
      <LinksPreviewPanel>
        <span>Mobile preview</span>
      </LinksPreviewPanel>
    );
    expect(screen.getByText("Mobile preview")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("items-center");
  });
});
