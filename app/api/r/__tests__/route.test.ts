import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    link: { findUnique: vi.fn(), update: vi.fn() },
    clickDaily: { upsert: vi.fn() },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    $executeRaw: vi.fn(),
  },
}));

const afterCallbacks: (() => Promise<void>)[] = [];
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: vi.fn((cb: () => Promise<void>) => {
      afterCallbacks.push(cb);
    }),
  };
});

import { db } from "@/lib/db";
import { GET } from "../[id]/route";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

function makeRequest(): Request {
  return new Request("https://linkhub.co/api/r/link_1", { headers: { referer: "https://linkhub.co/somehandle" } });
}

/** Runs every after()-registered callback, in the order route.ts scheduled them. */
async function runAfterCallbacks(): Promise<void> {
  for (const cb of afterCallbacks) await cb();
}

beforeEach(() => {
  vi.clearAllMocks();
  afterCallbacks.length = 0;
});

describe("GET /api/r/[id]", () => {
  it("returns 404 when the link does not exist", async () => {
    asMock(db.link.findUnique).mockResolvedValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("redirects 307 to the link URL and increments clicks non-blockingly", async () => {
    asMock(db.link.findUnique).mockResolvedValue({ url: "https://example.com", userId: "user_1" });
    asMock(db.link.update).mockResolvedValue({});
    asMock(db.clickDaily.upsert).mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any, { params: Promise.resolve({ id: "link_1" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/");
    expect(db.link.update).not.toHaveBeenCalled();

    await runAfterCallbacks();
    expect(db.link.update).toHaveBeenCalledWith({ where: { id: "link_1" }, data: { clicks: { increment: 1 } } });
  });

  it("writes device/referrer/country dimension rows for the link click, alongside the existing counters", async () => {
    asMock(db.link.findUnique).mockResolvedValue({ url: "https://example.com", userId: "user_1" });
    asMock(db.link.update).mockResolvedValue({});
    asMock(db.clickDaily.upsert).mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await GET(makeRequest() as any, { params: Promise.resolve({ id: "link_1" }) });
    await runAfterCallbacks();

    // incrementMetric writes via a raw INSERT ... ON CONFLICT statement (see lib/analytics/analytics.ts).
    expect(db.$executeRaw).toHaveBeenCalledTimes(3);
  });
});
