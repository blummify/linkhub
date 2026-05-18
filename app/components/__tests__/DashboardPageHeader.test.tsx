import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPageHeader } from "../DashboardPageHeader";

describe("DashboardPageHeader", () => {
  it("renders title and description", () => {
    render(<DashboardPageHeader title="My Links" description="Manage your links" />);
    expect(screen.getByText("My Links")).toBeInTheDocument();
    expect(screen.getByText("Manage your links")).toBeInTheDocument();
  });

  it("renders action slot when actions are provided", () => {
    render(
      <DashboardPageHeader
        title="T"
        description="D"
        actions={<button>Save</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("does not render action slot when actions is omitted", () => {
    const { container } = render(
      <DashboardPageHeader title="T" description="D" />
    );
    expect(container.querySelector("button")).toBeNull();
  });

  it("uses an h1 for the title", () => {
    render(<DashboardPageHeader title="Heading" description="D" />);
    expect(screen.getByRole("heading", { level: 1, name: "Heading" })).toBeInTheDocument();
  });
});
