import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportCard } from "../ReportCard";
import type { Report } from "../../services/types";

const highReport: Report = {
  id: "rep_1",
  handle: "@quick-cash-now",
  category: "phishing",
  severity: "high",
  reportCount: 3,
  description: "Impersonates a bank login page.",
  reporter: "@nadiaowusu",
  reportedAt: "4h ago",
  url: "linkhub.app/quick-cash-now",
  status: "open",
};

const mediumReport: Report = { ...highReport, id: "rep_2", severity: "medium", category: "spam", reportCount: 1 };

describe("ReportCard", () => {
  it("renders the report details", () => {
    render(<ReportCard report={highReport} onAction={vi.fn()} />);
    expect(screen.getByText("@quick-cash-now")).toBeInTheDocument();
    expect(screen.getByText("Phishing")).toBeInTheDocument();
    expect(screen.getByText("3 reports")).toBeInTheDocument();
    expect(screen.getByText("Impersonates a bank login page.")).toBeInTheDocument();
  });

  it("singularizes the report count", () => {
    render(<ReportCard report={mediumReport} onAction={vi.fn()} />);
    expect(screen.getByText("1 report")).toBeInTheDocument();
  });

  it("offers Take down for high severity and Warn for medium", () => {
    const onAction = vi.fn();
    const { rerender } = render(<ReportCard report={highReport} onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Take down" }));
    expect(onAction).toHaveBeenCalledWith("takedown");
    expect(screen.queryByRole("button", { name: "Warn" })).not.toBeInTheDocument();

    rerender(<ReportCard report={mediumReport} onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Warn" }));
    expect(onAction).toHaveBeenCalledWith("warn");
  });

  it("fires review and dismiss actions", () => {
    const onAction = vi.fn();
    render(<ReportCard report={highReport} onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(onAction).toHaveBeenCalledWith("review");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onAction).toHaveBeenCalledWith("dismiss");
  });
});
