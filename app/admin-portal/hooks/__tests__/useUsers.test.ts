import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { listUsers } = vi.hoisted(() => ({ listUsers: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { listUsers } }));

import { useUsers } from "../useUsers";

describe("useUsers", () => {
  beforeEach(() => {
    listUsers.mockReset();
  });

  it("loads a page of users", async () => {
    listUsers.mockResolvedValue({ users: [{ id: "1" }], total: 1, page: 1, pageSize: 8 });
    const { result } = renderHook(() => useUsers({ filter: "all", search: "", page: 1, pageSize: 8 }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.total).toBe(1);
    expect(listUsers).toHaveBeenCalledWith({ filter: "all", search: "", page: 1, pageSize: 8 });
  });

  it("handles an empty result", async () => {
    listUsers.mockResolvedValue({ users: [], total: 0, page: 1, pageSize: 8 });
    const { result } = renderHook(() => useUsers({ filter: "all", search: "zzz", page: 1, pageSize: 8 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.users).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("captures an error", async () => {
    listUsers.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useUsers({ filter: "all", search: "", page: 1, pageSize: 8 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("refetches when the query changes", async () => {
    listUsers.mockResolvedValue({ users: [], total: 0, page: 1, pageSize: 8 });
    const { rerender } = renderHook((props: { filter: "all" | "pro" }) =>
      useUsers({ filter: props.filter, search: "", page: 1, pageSize: 8 }), {
      initialProps: { filter: "all" },
    });

    await waitFor(() => expect(listUsers).toHaveBeenCalledTimes(1));
    rerender({ filter: "pro" });
    await waitFor(() => expect(listUsers).toHaveBeenCalledTimes(2));
    expect(listUsers).toHaveBeenLastCalledWith({ filter: "pro", search: "", page: 1, pageSize: 8 });
  });
});
