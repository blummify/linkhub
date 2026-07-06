import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { getOverviewMetrics } = vi.hoisted(() => ({ getOverviewMetrics: vi.fn() }));
vi.mock("../../services/adminService", () => ({
  adminService: { getOverviewMetrics },
}));

import { useOverviewMetrics } from "../useOverviewMetrics";

describe("useOverviewMetrics", () => {
  beforeEach(() => {
    getOverviewMetrics.mockReset();
  });

  it("starts loading and resolves with data", async () => {
    getOverviewMetrics.mockResolvedValue({ kpis: [{ id: "x" }] });
    const { result } = renderHook(() => useOverviewMetrics());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ kpis: [{ id: "x" }] });
    expect(result.current.error).toBeNull();
  });

  it("captures an error on failure", async () => {
    getOverviewMetrics.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useOverviewMetrics());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });

  it("handles an empty payload without erroring", async () => {
    getOverviewMetrics.mockResolvedValue({ kpis: [] });
    const { result } = renderHook(() => useOverviewMetrics());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.kpis).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
