import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { listAuditLog } = vi.hoisted(() => ({ listAuditLog: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { listAuditLog } }));

import { useAuditLog } from "../useAuditLog";

const BASE_QUERY = {
  search: "",
  actorId: "all",
  actionType: "all" as const,
  range: "7d" as const,
  page: 1,
  pageSize: 10,
};

describe("useAuditLog", () => {
  beforeEach(() => {
    listAuditLog.mockReset();
  });

  it("loads a page of entries", async () => {
    listAuditLog.mockResolvedValue({ entries: [{ id: "evt_1" }], total: 1, page: 1, pageSize: 10 });
    const { result } = renderHook(() => useAuditLog(BASE_QUERY));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.total).toBe(1);
    expect(listAuditLog).toHaveBeenCalledWith(BASE_QUERY);
  });

  it("handles an empty result", async () => {
    listAuditLog.mockResolvedValue({ entries: [], total: 0, page: 1, pageSize: 10 });
    const { result } = renderHook(() => useAuditLog({ ...BASE_QUERY, search: "zzz" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.entries).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("captures an error", async () => {
    listAuditLog.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAuditLog(BASE_QUERY));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("refetches when the query changes", async () => {
    listAuditLog.mockResolvedValue({ entries: [], total: 0, page: 1, pageSize: 10 });
    const { rerender } = renderHook(
      (props: { actorId: string }) => useAuditLog({ ...BASE_QUERY, actorId: props.actorId }),
      { initialProps: { actorId: "all" } }
    );

    await waitFor(() => expect(listAuditLog).toHaveBeenCalledTimes(1));
    rerender({ actorId: "act_sam" });
    await waitFor(() => expect(listAuditLog).toHaveBeenCalledTimes(2));
    expect(listAuditLog).toHaveBeenLastCalledWith({ ...BASE_QUERY, actorId: "act_sam" });
  });
});
