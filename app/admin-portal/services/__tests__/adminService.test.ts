import { describe, expect, it } from "vitest";
import { adminService } from "../adminService";
import { MOCK_AUDIT_LOG, MOCK_USERS } from "../mockData";

describe("adminService.listUsers", () => {
  it("paginates with a default page size of 8", async () => {
    const page = await adminService.listUsers();
    expect(page.users).toHaveLength(8);
    expect(page.page).toBe(1);
    expect(page.total).toBe(MOCK_USERS.length);
  });

  it("returns the requested page and clamps overflow to the last page", async () => {
    const second = await adminService.listUsers({ page: 2 });
    expect(second.page).toBe(2);
    expect(second.users[0]?.id).not.toBe(MOCK_USERS[0].id);

    const overflow = await adminService.listUsers({ page: 999 });
    const lastPage = Math.ceil(MOCK_USERS.length / 8);
    expect(overflow.page).toBe(lastPage);
  });

  it("filters by the suspended tab", async () => {
    const page = await adminService.listUsers({ filter: "suspended", pageSize: 100 });
    expect(page.users.length).toBeGreaterThan(0);
    expect(page.users.every((u) => u.status === "suspended")).toBe(true);
  });

  it("filters by plan tabs", async () => {
    const pro = await adminService.listUsers({ filter: "pro", pageSize: 100 });
    expect(pro.users.every((u) => u.plan === "pro")).toBe(true);
  });

  it("searches across name, email, and handle", async () => {
    const byHandle = await adminService.listUsers({ search: "joelosei" });
    expect(byHandle.total).toBe(1);
    expect(byHandle.users[0].name).toBe("Joel Osei Acquah");

    const byEmail = await adminService.listUsers({ search: "sara@addo.co" });
    expect(byEmail.users[0].handle).toBe("@saraa");
  });

  it("returns an empty page when nothing matches", async () => {
    const page = await adminService.listUsers({ search: "no-such-user" });
    expect(page.users).toHaveLength(0);
    expect(page.total).toBe(0);
    expect(page.page).toBe(1);
  });

  it("omits detail-only fields from list rows", async () => {
    const page = await adminService.listUsers();
    expect(page.users[0]).not.toHaveProperty("usage");
    expect(page.users[0]).not.toHaveProperty("recentActivity");
  });
});

describe("adminService.getUser", () => {
  it("returns the full detail for a known id", async () => {
    const user = await adminService.getUser("usr_joelosei");
    expect(user?.handle).toBe("@joelosei");
    expect(user?.usage.length).toBeGreaterThan(0);
    expect(user?.recentActivity.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown id", async () => {
    expect(await adminService.getUser("nope")).toBeNull();
  });
});

describe("adminService.listReports", () => {
  it("returns open reports by default", async () => {
    const reports = await adminService.listReports();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports.every((r) => r.status === "open")).toBe(true);
  });

  it("returns an empty list for a status with no reports", async () => {
    expect(await adminService.listReports("resolved")).toHaveLength(0);
  });
});

describe("adminService mutations", () => {
  it("acknowledge with ok:true", async () => {
    expect(await adminService.suspendUser("usr_joelosei")).toEqual({ ok: true });
    expect(await adminService.deleteUser("usr_joelosei")).toEqual({ ok: true });
    expect(await adminService.impersonateUser("usr_joelosei")).toEqual({ ok: true });
    expect(await adminService.changeUserPlan("usr_joelosei", "pro")).toEqual({ ok: true });
    expect(await adminService.sendPasswordReset("usr_joelosei")).toEqual({ ok: true });
    expect(await adminService.actOnReport("rep_quickcash", "takedown")).toEqual({ ok: true });
  });
});

describe("adminService.listAuditLog", () => {
  it("paginates with a default page size of 10, newest first", async () => {
    const page = await adminService.listAuditLog();
    expect(page.entries).toHaveLength(10);
    expect(page.page).toBe(1);
    expect(page.total).toBe(MOCK_AUDIT_LOG.length);
    expect(page.entries[0].id).toBe("evt_001");
  });

  it("clamps an out-of-range page to the last page", async () => {
    const overflow = await adminService.listAuditLog({ page: 999, pageSize: 50 });
    const lastPage = Math.ceil(MOCK_AUDIT_LOG.length / 50);
    expect(overflow.page).toBe(lastPage);
  });

  it("filters by actor", async () => {
    const page = await adminService.listAuditLog({ actorId: "act_sam", pageSize: 500 });
    expect(page.entries.length).toBeGreaterThan(0);
    expect(page.entries.every((e) => e.actor.id === "act_sam")).toBe(true);
  });

  it("filters by action type", async () => {
    const page = await adminService.listAuditLog({ actionType: "page_takedown", pageSize: 500 });
    expect(page.entries.length).toBeGreaterThan(0);
    expect(page.entries.every((e) => e.actionType === "page_takedown")).toBe(true);
  });

  it("filters by date range relative to the fixture's reference time", async () => {
    const page = await adminService.listAuditLog({ range: "24h", pageSize: 500 });
    expect(page.total).toBe(6);
  });

  it("searches across actor, action label, and target", async () => {
    const page = await adminService.listAuditLog({ search: "quick-cash-now" });
    expect(page.total).toBe(1);
    expect(page.entries[0].id).toBe("evt_001");
  });

  it("returns an empty page when nothing matches", async () => {
    const page = await adminService.listAuditLog({ search: "no-such-entry" });
    expect(page.entries).toHaveLength(0);
    expect(page.total).toBe(0);
  });

  it("omits detail-only fields from list rows", async () => {
    const page = await adminService.listAuditLog();
    expect(page.entries[0]).not.toHaveProperty("session");
    expect(page.entries[0]).not.toHaveProperty("reason");
    expect(page.entries[0]).not.toHaveProperty("changes");
  });
});

describe("adminService.getAuditLogEntry", () => {
  it("returns the full detail, including a reason, for a known id", async () => {
    const entry = await adminService.getAuditLogEntry("evt_001");
    expect(entry?.target).toBe("@quick-cash-now");
    expect(entry?.reason).toContain("Phishing");
    expect(entry?.session).toBeTruthy();
  });

  it("returns the full detail, including changes, for a known id", async () => {
    const entry = await adminService.getAuditLogEntry("evt_006");
    expect(entry?.changes).toEqual([{ field: "Monthly price", before: "€8.00", after: "€9.00" }]);
  });

  it("returns null for an unknown id", async () => {
    expect(await adminService.getAuditLogEntry("nope")).toBeNull();
  });
});

describe("adminService.exportAuditLog", () => {
  it("returns the full filtered set, unpaginated", async () => {
    const rows = await adminService.exportAuditLog({ range: "24h" });
    expect(rows).toHaveLength(6);
    expect(rows[0]).not.toHaveProperty("session");
  });
});
