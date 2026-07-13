import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { getPlans } = vi.hoisted(() => ({ getPlans: vi.fn() }));
vi.mock("../../services/adminService", () => ({
  adminService: { getPlans },
}));

import { usePlans } from "../usePlans";

describe("usePlans", () => {
  beforeEach(() => {
    getPlans.mockReset();
  });

  it("loads the plans snapshot", async () => {
    getPlans.mockResolvedValue({
      plans: [],
      flags: [],
      versions: [],
      auditLog: [],
    });

    const { result } = renderHook(() => usePlans());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ plans: [], flags: [], versions: [], auditLog: [] });
  });

  it("captures errors", async () => {
    getPlans.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => usePlans());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
