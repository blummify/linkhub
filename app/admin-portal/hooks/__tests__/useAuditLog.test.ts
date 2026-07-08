import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { listAuditLog } = vi.hoisted(() => ({ listAuditLog: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { listAuditLog } }));

import { useAuditLog } from "../useAuditLog";

const PAGE = { entries: [{ id: "aud_1" }], total: 1, page: 1, pageSize: 15 };

beforeEach(() => {
  listAuditLog.mockReset();
});

describe("useAuditLog", () => {
  it("loads a page of audit entries", async () => {
    listAuditLog.mockResolvedValue(PAGE);
    const { result } = renderHook(() => useAuditLog({ page: 1, pageSize: 15 }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.total).toBe(1);
    expect(listAuditLog).toHaveBeenCalledWith({ page: 1, pageSize: 15 });
  });

  it("captures an error while keeping previous data", async () => {
    listAuditLog.mockResolvedValueOnce(PAGE).mockRejectedValueOnce(new Error("boom"));
    const { result, rerender } = renderHook((props: { page: number }) =>
      useAuditLog({ page: props.page, pageSize: 15 }), { initialProps: { page: 1 } });

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.data?.total).toBe(1);
  });

  it("reports loading during a page change", async () => {
    listAuditLog.mockResolvedValue(PAGE);
    const { result, rerender } = renderHook((props: { page: number }) =>
      useAuditLog({ page: props.page, pageSize: 15 }), { initialProps: { page: 1 } });

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ page: 2 });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
