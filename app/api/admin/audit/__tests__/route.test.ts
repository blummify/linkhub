import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ── Mocks ── */
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {} }));

const { listAdminAuditLog } = vi.hoisted(() => ({ listAdminAuditLog: vi.fn() }));
vi.mock("@/lib/adminAudit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/adminAudit")>()),
  listAdminAuditLog,
}));

import { GET } from "../route";
import { auth } from "@/auth";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const PAGE = { entries: [], total: 0, page: 1, pageSize: 15 };
const request = (qs = "") => new Request(`http://admin.localhost/api/admin/audit${qs}`);

beforeEach(() => {
  vi.clearAllMocks();
  listAdminAuditLog.mockResolvedValue(PAGE);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/admin/audit (production guard)", () => {
  it("rejects anonymous and non-admin requests", async () => {
    vi.stubEnv("NODE_ENV", "production");

    asMock(auth).mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);

    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "USER" } });
    expect((await GET(request())).status).toBe(403);
    expect(listAdminAuditLog).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/audit (dev bypass)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("returns the page and passes parsed params", async () => {
    const res = await GET(request("?page=2&pageSize=30"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(PAGE);
    expect(listAdminAuditLog).toHaveBeenCalledWith(expect.anything(), { page: 2, pageSize: 30 });
  });

  it("rejects an invalid query with 400", async () => {
    const res = await GET(request("?page=zero"));
    expect(res.status).toBe(400);
    expect(listAdminAuditLog).not.toHaveBeenCalled();
  });
});
