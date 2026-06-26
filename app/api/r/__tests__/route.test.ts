import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { link: { findUnique: vi.fn(), update: vi.fn() } },
}));

let afterCallback: (() => Promise<void>) | undefined;
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: vi.fn((cb: () => Promise<void>) => {
      afterCallback = cb;
    }),
  };
});

import { db } from "@/lib/db";
import { GET } from "../[id]/route";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

function makeRequest(): Request {
  return new Request("https://linkhub.co/api/r/link_1");
}

beforeEach(() => {
  vi.clearAllMocks();
  afterCallback = undefined;
});

describe("GET /api/r/[id]", () => {
  it("returns 404 when the link does not exist", async () => {
    asMock(db.link.findUnique).mockResolvedValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("redirects 307 to the link URL and increments clicks non-blockingly", async () => {
    asMock(db.link.findUnique).mockResolvedValue({ url: "https://example.com" });
    asMock(db.link.update).mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any, { params: Promise.resolve({ id: "link_1" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/");
    expect(db.link.update).not.toHaveBeenCalled();

    await afterCallback?.();
    expect(db.link.update).toHaveBeenCalledWith({ where: { id: "link_1" }, data: { clicks: { increment: 1 } } });
  });
});
