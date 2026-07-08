import { afterEach, describe, expect, it, vi } from "vitest";
import { adminService } from "../adminService";
import type { UserPage } from "../types";

const EMPTY_PAGE: UserPage = { users: [], total: 0, page: 1, pageSize: 8 };

/** Takes a factory because a Response body can only be consumed once per call. */
function stubFetch(makeResponse: () => Response) {
  const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () =>
    makeResponse()
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("adminService.listUsers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the users API with the full query", async () => {
    const fetchMock = stubFetch(() => new Response(JSON.stringify(EMPTY_PAGE)));
    await adminService.listUsers({
      search: "sara",
      filter: "pro",
      page: 2,
      pageSize: 8,
      sort: "views",
      dir: "asc",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/admin/users?search=sara&filter=pro&page=2&pageSize=8&sort=views&dir=asc"
    );
  });

  it("omits unset params so the server applies its defaults", async () => {
    const fetchMock = stubFetch(() => new Response(JSON.stringify(EMPTY_PAGE)));
    await adminService.listUsers();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/users?");
  });

  it("returns the parsed page", async () => {
    stubFetch(() => new Response(JSON.stringify({ ...EMPTY_PAGE, total: 3 })));
    const page = await adminService.listUsers();
    expect(page.total).toBe(3);
  });

  it("throws a descriptive error on a failed response", async () => {
    stubFetch(() => new Response("nope", { status: 500 }));
    await expect(adminService.listUsers()).rejects.toThrow(/HTTP 500/);
  });
});

describe("adminService.getUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the detail endpoint and returns the parsed body", async () => {
    const fetchMock = stubFetch(() => new Response(JSON.stringify({ id: "usr_1", handle: "@joel" })));
    const user = await adminService.getUser("usr_1");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/users/usr_1");
    expect(user?.handle).toBe("@joel");
  });

  it("returns null for an unknown id", async () => {
    stubFetch(() => new Response("not found", { status: 404 }));
    expect(await adminService.getUser("nope")).toBeNull();
  });

  it("throws a descriptive error on a failed response", async () => {
    stubFetch(() => new Response("boom", { status: 500 }));
    await expect(adminService.getUser("usr_1")).rejects.toThrow(/HTTP 500/);
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

describe("adminService.listAuditLog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the audit API with paging params", async () => {
    const fetchMock = stubFetch(
      () => new Response(JSON.stringify({ entries: [], total: 0, page: 2, pageSize: 30 }))
    );
    const page = await adminService.listAuditLog({ page: 2, pageSize: 30 });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/audit?page=2&pageSize=30");
    expect(page.pageSize).toBe(30);
  });

  it("throws a descriptive error on a failed response", async () => {
    stubFetch(() => new Response("nope", { status: 500 }));
    await expect(adminService.listAuditLog()).rejects.toThrow(/HTTP 500/);
  });
});

describe("adminService mutations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const OK = () => new Response(JSON.stringify({ ok: true }));

  it("PATCHes user actions with a typed body", async () => {
    const fetchMock = stubFetch(OK);

    expect(await adminService.suspendUser("usr_1")).toEqual({ ok: true });
    expect(await adminService.unsuspendUser("usr_1")).toEqual({ ok: true });
    expect(await adminService.changeUserPlan("usr_1", "business")).toEqual({ ok: true });
    expect(await adminService.sendPasswordReset("usr_1")).toEqual({ ok: true });

    const bodies = fetchMock.mock.calls.map(([url, init]) => ({
      url,
      method: init?.method,
      body: JSON.parse(init?.body as string),
    }));
    expect(bodies).toEqual([
      { url: "/api/admin/users/usr_1", method: "PATCH", body: { action: "suspend" } },
      { url: "/api/admin/users/usr_1", method: "PATCH", body: { action: "unsuspend" } },
      {
        url: "/api/admin/users/usr_1",
        method: "PATCH",
        body: { action: "changePlan", plan: "business" },
      },
      { url: "/api/admin/users/usr_1", method: "PATCH", body: { action: "sendReset" } },
    ]);
  });

  it("DELETEs the user resource", async () => {
    const fetchMock = stubFetch(OK);
    expect(await adminService.deleteUser("usr_1")).toEqual({ ok: true });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/users/usr_1");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("surfaces the server's error message on failure", async () => {
    stubFetch(
      () =>
        new Response(JSON.stringify({ error: "Staff accounts cannot be managed here" }), {
          status: 403,
        })
    );
    await expect(adminService.suspendUser("usr_admin")).rejects.toThrow(
      "Staff accounts cannot be managed here"
    );
  });

  it("keeps the local stubs acknowledging", async () => {
    expect(await adminService.impersonateUser("usr_1")).toEqual({ ok: true });
    expect(await adminService.actOnReport("rep_quickcash", "takedown")).toEqual({ ok: true });
  });
});
