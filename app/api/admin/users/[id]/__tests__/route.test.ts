import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ── Mocks ── */
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {} }));

const { getAdminUserDetail } = vi.hoisted(() => ({ getAdminUserDetail: vi.fn() }));
vi.mock("@/lib/adminUserDetail", () => ({ getAdminUserDetail }));

const actions = vi.hoisted(() => ({
  suspendAdminUser: vi.fn(),
  unsuspendAdminUser: vi.fn(),
  deleteAdminUser: vi.fn(),
  changeAdminUserPlan: vi.fn(),
  sendAdminPasswordReset: vi.fn(),
}));
vi.mock("@/lib/adminUserActions", () => actions);

import { DELETE, GET, PATCH } from "../route";
import { auth } from "@/auth";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const DETAIL = { id: "usr_1", name: "Joel" };
const URL_BASE = "http://admin.localhost/api/admin/users/usr_1";
const request = () => new Request(URL_BASE);
const patchRequest = (body: unknown) =>
  new Request(URL_BASE, {
    method: "PATCH",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const deleteRequest = () => new Request(URL_BASE, { method: "DELETE" });
const ctx = (id = "usr_1") => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  getAdminUserDetail.mockResolvedValue(DETAIL);
  for (const action of Object.values(actions)) {
    action.mockResolvedValue({ ok: true });
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/admin/users/:id (production guard)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  it("returns 401 without a session", async () => {
    asMock(auth).mockResolvedValue(null);
    expect((await GET(request(), ctx())).status).toBe(401);
    expect(getAdminUserDetail).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-super-admin session", async () => {
    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "USER" } });
    expect((await GET(request(), ctx())).status).toBe(403);
  });

  it("returns the detail for a super admin", async () => {
    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "SUPER_ADMIN" } });
    const res = await GET(request(), ctx());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(DETAIL);
  });

  it("guards PATCH and DELETE the same way", async () => {
    asMock(auth).mockResolvedValue(null);
    expect((await PATCH(patchRequest({ action: "suspend" }), ctx())).status).toBe(401);
    expect((await DELETE(deleteRequest(), ctx())).status).toBe(401);
    expect(actions.suspendAdminUser).not.toHaveBeenCalled();
    expect(actions.deleteAdminUser).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/users/:id (dev bypass)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("skips the session check outside production", async () => {
    const res = await GET(request(), ctx());
    expect(res.status).toBe(200);
    expect(auth).not.toHaveBeenCalled();
  });

  it("passes the route param through and 404s on a missing user", async () => {
    getAdminUserDetail.mockResolvedValue(null);
    const res = await GET(request(), ctx("ghost"));
    expect(getAdminUserDetail).toHaveBeenCalledWith(expect.anything(), "ghost");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/admin/users/:id", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("dispatches each action to its handler", async () => {
    await PATCH(patchRequest({ action: "suspend" }), ctx());
    expect(actions.suspendAdminUser).toHaveBeenCalledWith(
      expect.anything(),
      { id: null, email: null },
      "usr_1"
    );

    await PATCH(patchRequest({ action: "unsuspend" }), ctx());
    expect(actions.unsuspendAdminUser).toHaveBeenCalled();

    await PATCH(patchRequest({ action: "changePlan", plan: "business" }), ctx());
    expect(actions.changeAdminUserPlan).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "usr_1",
      "business"
    );

    await PATCH(patchRequest({ action: "sendReset" }), ctx());
    expect(actions.sendAdminPasswordReset).toHaveBeenCalled();
  });

  it("maps action outcomes onto the response", async () => {
    actions.suspendAdminUser.mockResolvedValue({
      ok: false,
      status: 403,
      error: "Staff accounts cannot be managed here",
    });
    const res = await PATCH(patchRequest({ action: "suspend" }), ctx());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Staff accounts cannot be managed here" });
  });

  it("rejects malformed bodies with 400", async () => {
    expect((await PATCH(patchRequest("not json"), ctx())).status).toBe(400);
    expect((await PATCH(patchRequest({ action: "explode" }), ctx())).status).toBe(400);
    expect(
      (await PATCH(patchRequest({ action: "changePlan", plan: "enterprise" }), ctx())).status
    ).toBe(400);
  });
});

describe("DELETE /api/admin/users/:id", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("deletes and returns ok", async () => {
    const res = await DELETE(deleteRequest(), ctx());
    expect(res.status).toBe(200);
    expect(actions.deleteAdminUser).toHaveBeenCalledWith(
      expect.anything(),
      { id: null, email: null },
      "usr_1"
    );
  });

  it("propagates a not-found outcome", async () => {
    actions.deleteAdminUser.mockResolvedValue({ ok: false, status: 404, error: "User not found" });
    expect((await DELETE(deleteRequest(), ctx("ghost"))).status).toBe(404);
  });
});
