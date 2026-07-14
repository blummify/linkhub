import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { requireAdminActor } from "../adminApiGuard";
import { auth } from "@/auth";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("requireAdminActor (production)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  it("rejects anonymous requests with 401", async () => {
    asMock(auth).mockResolvedValue(null);
    expect(await requireAdminActor()).toEqual({ ok: false, status: 401, error: "Unauthorized" });
  });

  it("rejects non-super-admin sessions with 403", async () => {
    asMock(auth).mockResolvedValue({ user: { id: "u1", role: "USER" } });
    expect(await requireAdminActor()).toEqual({ ok: false, status: 403, error: "Forbidden" });
  });

  it("returns the actor for a super admin", async () => {
    asMock(auth).mockResolvedValue({
      user: { id: "adm_1", email: "staff@linkhub.app", role: "SUPER_ADMIN" },
    });
    expect(await requireAdminActor()).toEqual({
      ok: true,
      actor: { id: "adm_1", email: "staff@linkhub.app" },
    });
  });
});

describe("requireAdminActor (dev bypass)", () => {
  it("allows without a session outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(await requireAdminActor()).toEqual({ ok: true, actor: { id: null, email: null } });
    expect(auth).not.toHaveBeenCalled();
  });
});
