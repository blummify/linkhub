import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RolesLegend } from "../RolesLegend";

describe("RolesLegend", () => {
  it("documents the scope of every admin role", () => {
    render(<RolesLegend />);

    expect(screen.getByText("Roles & permissions")).toBeInTheDocument();

    expect(screen.getByText("Super admin")).toBeInTheDocument();
    expect(
      screen.getByText("Full access — users, billing, moderation, team, settings, delete & impersonate.")
    ).toBeInTheDocument();

    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(
      screen.getByText("View users, send resets, suspend; no delete, no billing.")
    ).toBeInTheDocument();

    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(
      screen.getByText("Revenue, plans, invoices, refunds; no user or moderation actions.")
    ).toBeInTheDocument();

    expect(screen.getByText("Moderator")).toBeInTheDocument();
    expect(
      screen.getByText("Moderation queue, take downs, page suspensions only.")
    ).toBeInTheDocument();
  });
});
