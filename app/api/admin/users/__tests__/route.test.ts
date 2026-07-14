import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ── Mocks ── */
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {} }));

const { listAdminUsers } = vi.hoisted(() => ({ listAdminUsers: vi.fn() }));
vi.mock("@/lib/adminUsers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/adminUsers")>()),
  listAdminUsers,
}));

import { GET } from "../route";
import { auth } from "@/auth";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const PAGE = { users: [], total: 0, page: 1, pageSize: 8 };
const request = (qs = "") => new Request(`http://admin.localhost/api/admin/users${qs}`);

beforeEach(() => {
  vi.clearAllMocks();
  listAdminUsers.mockResolvedValue(PAGE);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/admin/users (production guard)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  it("returns 401 without a session", async () => {
    asMock(auth).mockResolvedValue(null);
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(listAdminUsers).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-super-admin session", async () => {
    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "USER" } });
    const res = await GET(request());
    expect(res.status).toBe(403);
    expect(listAdminUsers).not.toHaveBeenCalled();
  });

  it("returns the page for a super admin", async () => {
    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "SUPER_ADMIN" } });
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(PAGE);
  });
});

describe("GET /api/admin/users (dev bypass)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("skips the session check outside production", async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejects an invalid query with 400", async () => {
    const res = await GET(request("?filter=bogus"));
    expect(res.status).toBe(400);
    expect(listAdminUsers).not.toHaveBeenCalled();
  });

  it("passes the parsed query through to the lister", async () => {
    await GET(request("?search=jo&filter=pro&page=2&pageSize=10&sort=views&dir=asc"));
    expect(listAdminUsers).toHaveBeenCalledWith(expect.anything(), {
      search: "jo",
      filter: "pro",
      page: 2,
      pageSize: 10,
      sort: "views",
      dir: "asc",
    });
  });
});
