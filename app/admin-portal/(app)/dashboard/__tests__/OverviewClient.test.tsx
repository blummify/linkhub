import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useOverviewMetrics } = vi.hoisted(() => ({ useOverviewMetrics: vi.fn() }));
vi.mock("../../../hooks/useOverviewMetrics", () => ({ useOverviewMetrics }));

import { OverviewClient } from "../OverviewClient";
import { MOCK_OVERVIEW } from "../../../services/mockData";

describe("OverviewClient", () => {
  beforeEach(() => {
    useOverviewMetrics.mockReset();
  });

  it("renders a skeleton while loading", () => {
    useOverviewMetrics.mockReturnValue({ data: null, loading: true, error: null });
    const { container } = render(<OverviewClient />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("renders an error state", () => {
    useOverviewMetrics.mockReturnValue({ data: null, loading: false, error: new Error("x") });
    render(<OverviewClient />);
    expect(screen.getByText(/Couldn't load platform metrics/i)).toBeInTheDocument();
  });

  it("renders KPIs, feeds, and the moderation queue when populated", () => {
    useOverviewMetrics.mockReturnValue({ data: MOCK_OVERVIEW, loading: false, error: null });
    render(<OverviewClient />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Overview.");
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("48,210")).toBeInTheDocument();
    expect(screen.getByText("Recent signups")).toBeInTheDocument();
    expect(screen.getByText("Moderation queue")).toBeInTheDocument();
    expect(screen.getByText("Kofi Twum")).toBeInTheDocument();
  });
});
