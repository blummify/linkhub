import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { getAuditLogEntry } = vi.hoisted(() => ({ getAuditLogEntry: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { getAuditLogEntry } }));

import { useAuditLogEntry } from "../useAuditLogEntry";

describe("useAuditLogEntry", () => {
  beforeEach(() => {
    getAuditLogEntry.mockReset();
  });

  it("loads the requested entry", async () => {
    getAuditLogEntry.mockResolvedValue({ id: "evt_1", target: "@quick-cash-now" });
    const { result } = renderHook(() => useAuditLogEntry("evt_1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.target).toBe("@quick-cash-now");
    expect(getAuditLogEntry).toHaveBeenCalledWith("evt_1");
  });

  it("returns null data for an unknown entry", async () => {
    getAuditLogEntry.mockResolvedValue(null);
    const { result } = renderHook(() => useAuditLogEntry("nope"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("captures an error", async () => {
    getAuditLogEntry.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAuditLogEntry("evt_1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
