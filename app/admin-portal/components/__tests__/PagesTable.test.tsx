import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PagesTable } from "../PagesTable";
import type { AdminPageListItem } from "../../services/types";

const pages: AdminPageListItem[] = [
  {
    id: "page_1",
    handle: "@joelosei",
    owner: { id: "usr_1", name: "Joel Osei Acquah", handle: "@joelosei" },
    url: "https://linkhub.app/joelosei",
    status: "live",
    links: 15,
    views30d: 8420,
    reports: 0,
    createdAt: "2026-05-24",
    theme: "Midnight",
  },
  {
    id: "page_2",
    handle: "@quick-cash-now",
    owner: { id: "usr_2", name: "Quick Cash", handle: "@quick-cash-now" },
    url: "https://linkhub.app/quick-cash-now",
    status: "flagged",
    links: 9,
    views30d: 120,
    reports: 3,
    createdAt: "2026-06-19",
    theme: "Alert",
  },
];

describe("PagesTable", () => {
  it("renders page rows with the expected fields", () => {
    render(<PagesTable pages={pages} onSelect={vi.fn()} />);

    expect(screen.getByText("@joelosei")).toBeInTheDocument();
    expect(screen.getByText("Joel Osei Acquah")).toBeInTheDocument();
    expect(screen.getByText("linkhub.app/joelosei")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("8,420")).toBeInTheDocument();
    expect(screen.getByText("24 May 2026")).toBeInTheDocument();
  });

  it("selects a page by click and keyboard", () => {
    const onSelect = vi.fn();
    render(<PagesTable pages={pages} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("@joelosei"));
    expect(onSelect).toHaveBeenCalledWith("page_1");

    fireEvent.keyDown(screen.getByText("@quick-cash-now").closest("tr")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("page_2");
  });
});
