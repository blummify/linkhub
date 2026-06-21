import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ClicksTrendChart } from "../ClicksTrendChart";
import type { ManagedLink } from "../types";

const withClicks: ManagedLink[] = [
  { id: "1", title: "Site A", url: "https://site-a.com", clicks: "100" },
  { id: "2", title: "Site B", url: "https://site-b.com", clicks: "200" },
];

const zeroClicks: ManagedLink[] = [
  { id: "1", title: "Site A", url: "https://site-a.com", clicks: "0" },
];

describe("ClicksTrendChart", () => {
  it("renders the zero-click empty state when there are no clicks", () => {
    render(<ClicksTrendChart links={zeroClicks} />);
    expect(screen.getByText("0 clicks")).toBeInTheDocument();
    expect(screen.getByText(/share your page/i)).toBeInTheDocument();
  });

  it("does not render the chart or range toggle at zero clicks", () => {
    render(<ClicksTrendChart links={zeroClicks} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /select time range/i })).not.toBeInTheDocument();
  });

  it("renders the chart and total when there is at least one click", () => {
    render(<ClicksTrendChart links={withClicks} />);
    expect(screen.getByRole("img", { name: /clicks over the last 7 days/i })).toBeInTheDocument();
    expect(screen.getByText(/300 total clicks/i)).toBeInTheDocument();
  });

  it("toggles between 7D and 30D views", () => {
    render(<ClicksTrendChart links={withClicks} />);
    const group = screen.getByRole("group", { name: /select time range/i });

    expect(screen.getByRole("img", { name: /last 7 days/i })).toBeInTheDocument();

    fireEvent.click(within(group).getByRole("button", { name: "30D" }));

    expect(screen.getByRole("img", { name: /last 30 days/i })).toBeInTheDocument();
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
  });
});
