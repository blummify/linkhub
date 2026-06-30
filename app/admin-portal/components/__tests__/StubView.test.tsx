import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StubView } from "../StubView";

describe("StubView", () => {
  it("renders the page header, heading, and description", () => {
    render(
      <StubView
        crumb="Admin / Plans"
        title="Plans."
        icon="plans"
        heading="Plans & limits"
        description="Manage tiers, pricing, limits, and feature flags."
      />
    );
    expect(screen.getByText("Admin / Plans")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plans & limits" })).toBeInTheDocument();
    expect(
      screen.getByText("Manage tiers, pricing, limits, and feature flags.")
    ).toBeInTheDocument();
  });
});
