import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PlatformSettings } from "../../services/types";

const svc = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateGeneralSettings: vi.fn(),
  updateSafetySettings: vi.fn(),
  addReservedHandle: vi.fn(),
  removeReservedHandle: vi.fn(),
  setMaintenanceMode: vi.fn(),
  purgeCdnCache: vi.fn(),
}));
vi.mock("../../services/adminService", () => ({ adminService: svc }));

import { useSettings } from "../useSettings";

const makeSettings = (): PlatformSettings => ({
  general: { defaultCurrency: "EUR", supportEmail: "support@linkhub.app" },
  safety: { autoFlagSuspiciousLinks: true, autoSuspendAfterReports: 3 },
  reservedHandles: ["admin"],
  system: { maintenanceMode: false },
});

describe("useSettings", () => {
  beforeEach(() => {
    Object.values(svc).forEach((fn) => fn.mockReset());
    svc.getSettings.mockResolvedValue(makeSettings());
    svc.updateGeneralSettings.mockResolvedValue({ ok: true });
    svc.updateSafetySettings.mockResolvedValue({ ok: true });
    svc.addReservedHandle.mockResolvedValue({ ok: true });
    svc.removeReservedHandle.mockResolvedValue({ ok: true });
    svc.setMaintenanceMode.mockResolvedValue({ ok: true });
    svc.purgeCdnCache.mockResolvedValue({ ok: true });
  });

  async function loaded() {
    const hook = renderHook(() => useSettings());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook;
  }

  it("loads settings", async () => {
    const { result } = await loaded();
    expect(result.current.data?.reservedHandles).toEqual(["admin"]);
  });

  it("captures a load error", async () => {
    svc.getSettings.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });

  it("adds a reserved handle after the mutation resolves", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.addReservedHandle("checkout");
    });
    expect(svc.addReservedHandle).toHaveBeenCalledWith("checkout");
    expect(result.current.data?.reservedHandles).toEqual(["admin", "checkout"]);
  });

  it("does not duplicate an existing reserved handle", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.addReservedHandle("admin");
    });
    expect(result.current.data?.reservedHandles).toEqual(["admin"]);
  });

  it("removes a reserved handle", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.removeReservedHandle("admin");
    });
    expect(result.current.data?.reservedHandles).toEqual([]);
  });

  it("updates maintenance mode", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.setMaintenanceMode(true);
    });
    expect(svc.setMaintenanceMode).toHaveBeenCalledWith(true);
    expect(result.current.data?.system.maintenanceMode).toBe(true);
  });

  it("saves general settings", async () => {
    const { result } = await loaded();
    const next = { defaultCurrency: "USD", supportEmail: "new@linkhub.app" } as const;
    await act(async () => {
      await result.current.saveGeneral(next);
    });
    expect(result.current.data?.general).toEqual(next);
  });

  it("leaves local state untouched when a mutation rejects", async () => {
    svc.setMaintenanceMode.mockRejectedValueOnce(new Error("nope"));
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.setMaintenanceMode(true)).rejects.toThrow();
    });
    expect(result.current.data?.system.maintenanceMode).toBe(false);
  });
});
