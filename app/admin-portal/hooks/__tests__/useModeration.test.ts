import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { listReports } = vi.hoisted(() => ({ listReports: vi.fn() }));
vi.mock("../../services/adminService", () => ({ adminService: { listReports } }));

import { useModeration } from "../useModeration";

describe("useModeration", () => {
  beforeEach(() => {
    listReports.mockReset();
  });

  it("loads reports for the status", async () => {
    listReports.mockResolvedValue([{ id: "r1" }]);
    const { result } = renderHook(() => useModeration("open"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(listReports).toHaveBeenCalledWith("open");
  });

  it("handles an empty queue", async () => {
    listReports.mockResolvedValue([]);
    const { result } = renderHook(() => useModeration("resolved"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it("captures an error", async () => {
    listReports.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useModeration("open"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("refetches when the status changes", async () => {
    listReports.mockResolvedValue([]);
    const { rerender } = renderHook((props: { status: "open" | "resolved" }) => useModeration(props.status), {
      initialProps: { status: "open" },
    });

    await waitFor(() => expect(listReports).toHaveBeenCalledTimes(1));
    rerender({ status: "resolved" });
    await waitFor(() => expect(listReports).toHaveBeenLastCalledWith("resolved"));
  });
});
