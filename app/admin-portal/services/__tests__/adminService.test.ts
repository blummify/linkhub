import { describe, expect, it } from "vitest";
import { adminService } from "../adminService";
import { MOCK_PAGES, MOCK_USERS } from "../mockData";

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

describe("adminService.listPages", () => {
  it("paginates and sorts the pages feed", async () => {
    const page = await adminService.listPages();
    expect(page.pages).toHaveLength(8);
    expect(page.page).toBe(1);
    expect(page.total).toBe(MOCK_PAGES.length);
    expect(page.pages[0]?.id).toBe("page_cryptodoubler");
  });

  it("filters by status and searches by owner", async () => {
    const suspended = await adminService.listPages({ filter: "suspended", pageSize: 100 });
    expect(suspended.pages.every((item) => item.status === "suspended")).toBe(true);

    const searched = await adminService.listPages({ search: "sara", pageSize: 100 });
    expect(searched.pages[0]?.handle).toBe("@saraa");
  });

  it("returns detail records with published links and report history", async () => {
    const page = await adminService.getPage("page_quickcash");
    expect(page?.publishedLinks.length).toBeGreaterThan(0);
    expect(page?.reportHistory.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown page", async () => {
    expect(await adminService.getPage("nope")).toBeNull();
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
    expect(await adminService.suspendPage("page_joelosei")).toEqual({ ok: true });
    expect(await adminService.takeDownPage("page_joelosei")).toEqual({ ok: true });
    expect(await adminService.actOnReport("rep_quickcash", "takedown")).toEqual({ ok: true });
  });
});
