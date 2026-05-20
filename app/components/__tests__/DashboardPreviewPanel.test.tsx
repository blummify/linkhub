import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreviewPanel } from "../DashboardPreviewPanel";

const links = [
  {
    id: "1",
    title: "Website",
    url: "https://example.com",
    clicks: "10",
    draft: false,
  },
];

describe("DashboardPreviewPanel", () => {
  it("renders display name and device toggles", () => {
    render(
      <DashboardPreviewPanel
        links={links}
        displayName="Alex Rivera"
        handle="alex"
        publicUrl="linkhub.co/alex"
      />
    );
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText(/Mobile/)).toBeInTheDocument();
    expect(screen.getByText(/Desktop/)).toBeInTheDocument();
  });

  it("renders theme footer when themeLabel is set", () => {
    render(
      <DashboardPreviewPanel
        links={links}
        displayName="Alex"
        publicUrl="linkhub.co/alex"
        themeLabel="Monochrome"
        onRandomTheme={() => {}}
      />
    );
    expect(screen.getByText(/Monochrome/)).toBeInTheDocument();
  });
});
