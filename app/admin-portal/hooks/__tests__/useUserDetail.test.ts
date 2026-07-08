import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { getUser } }));

import { useUserDetail } from "../useUserDetail";

describe("useUserDetail", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("loads the requested user", async () => {
    getUser.mockResolvedValue({ id: "usr_1", name: "Joel" });
    const { result } = renderHook(() => useUserDetail("usr_1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.name).toBe("Joel");
    expect(getUser).toHaveBeenCalledWith("usr_1");
  });

  it("returns null data for an unknown user", async () => {
    getUser.mockResolvedValue(null);
    const { result } = renderHook(() => useUserDetail("nope"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("captures an error", async () => {
    getUser.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useUserDetail("usr_1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
