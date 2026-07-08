import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminPageHeader } from "../AdminPageHeader";

describe("AdminPageHeader", () => {
  it("renders the crumb, composed title, and subtitle", () => {
    render(
      <AdminPageHeader
        crumb="Admin / Overview"
        title="Over"
        accent="view."
        subtitle="Platform health at a glance."
      />
    );
    expect(screen.getByText("Admin / Overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Overview.");
    expect(screen.getByText("view.")).toHaveClass("text-indigo-500");
    expect(screen.getByText("Platform health at a glance.")).toBeInTheDocument();
  });

  it("renders an optional action slot", () => {
    render(<AdminPageHeader crumb="Admin / Users" title="Users." action={<button type="button">Export</button>} />);
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });
});
