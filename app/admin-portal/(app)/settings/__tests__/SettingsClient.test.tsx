import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PlatformSettings } from "../../../services/types";

const svc = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateGeneralSettings: vi.fn(),
  updateSafetySettings: vi.fn(),
  addReservedHandle: vi.fn(),
  removeReservedHandle: vi.fn(),
  setMaintenanceMode: vi.fn(),
  purgeCdnCache: vi.fn(),
}));
vi.mock("../../../services/adminService", () => ({ adminService: svc }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { SettingsClient } from "../SettingsClient";

const makeSettings = (): PlatformSettings => ({
  general: { defaultCurrency: "EUR", supportEmail: "support@linkhub.app" },
  safety: { autoFlagSuspiciousLinks: true, autoSuspendAfterReports: 3 },
  reservedHandles: ["admin"],
  system: { maintenanceMode: false },
});

describe("SettingsClient", () => {
  beforeEach(() => {
    Object.values(svc).forEach((fn) => fn.mockReset());
    svc.getSettings.mockResolvedValue(makeSettings());
    svc.addReservedHandle.mockResolvedValue({ ok: true });
    svc.setMaintenanceMode.mockResolvedValue({ ok: true });
  });

  it("renders the sections once settings load", async () => {
    render(<SettingsClient />);
    expect(await screen.findByText("General")).toBeInTheDocument();
    expect(screen.getByText("Abuse & safety")).toBeInTheDocument();
    expect(screen.getByText("Reserved handles")).toBeInTheDocument();
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("adds a reserved handle on Enter", async () => {
    render(<SettingsClient />);
    const input = await screen.findByLabelText("Add a reserved handle");
    fireEvent.change(input, { target: { value: "checkout" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(svc.addReservedHandle).toHaveBeenCalledWith("checkout"));
    expect(await screen.findByText("checkout")).toBeInTheDocument();
  });

  it("rejects an invalid handle without calling the service", async () => {
    render(<SettingsClient />);
    const input = await screen.findByLabelText("Add a reserved handle");
    fireEvent.change(input, { target: { value: "no" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText(/3–24 letters/)).toBeInTheDocument();
    expect(svc.addReservedHandle).not.toHaveBeenCalled();
  });

  it("confirms before enabling maintenance mode", async () => {
    render(<SettingsClient />);
    const toggle = await screen.findByRole("switch", { name: "Maintenance mode" });
    fireEvent.click(toggle);

    const dialog = await screen.findByRole("alertdialog", { name: "Enable maintenance mode?" });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enable maintenance" }));
    await waitFor(() => expect(svc.setMaintenanceMode).toHaveBeenCalledWith(true));
    expect(await screen.findByText("Offline")).toBeInTheDocument();
  });
});
