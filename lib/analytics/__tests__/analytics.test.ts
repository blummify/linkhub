import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { $executeRaw: vi.fn(), $queryRaw: vi.fn() },
}));

import { db } from "@/lib/db";
import { incrementMetric, getMetricTotal, getMetricSeries, truncateToUtcDate } from "../analytics";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("truncateToUtcDate", () => {
  it("buckets a known timestamp into its UTC day, regardless of time-of-day", () => {
    const d = new Date("2026-06-22T23:59:59.999Z");
    const bucketed = truncateToUtcDate(d);
    expect(bucketed.toISOString()).toBe("2026-06-22T00:00:00.000Z");
  });
});

describe("incrementMetric", () => {
  it("issues a single upsert statement", async () => {
    asMock(db.$executeRaw).mockResolvedValue(1);
    await incrementMetric("u1", "profile_view");
    expect(db.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it("swallows DB errors instead of throwing", async () => {
    asMock(db.$executeRaw).mockRejectedValue(new Error("db down"));
    await expect(incrementMetric("u1", "profile_view")).resolves.toBeUndefined();
  });
});

describe("getMetricTotal", () => {
  it("returns the summed total", async () => {
    asMock(db.$queryRaw).mockResolvedValue([{ total: 42 }]);
    const result = await getMetricTotal("u1", "profile_view");
    expect(result).toBe(42);
  });

  it("returns 0 when there are no rows", async () => {
    asMock(db.$queryRaw).mockResolvedValue([{ total: null }]);
    const result = await getMetricTotal("u1", "profile_view");
    expect(result).toBe(0);
  });
});

describe("getMetricSeries", () => {
  it("zero-fills days with no rows", async () => {
    asMock(db.$queryRaw).mockResolvedValue([]);
    const series = await getMetricSeries("u1", "profile_view", 3);
    expect(series).toHaveLength(3);
    expect(series.every((point) => point.count === 0)).toBe(true);
  });

  it("fills in counts for days that have rows", async () => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    asMock(db.$queryRaw).mockResolvedValue([{ date: new Date(todayIso), total: 7 }]);
    const series = await getMetricSeries("u1", "profile_view", 1);
    expect(series).toEqual([{ date: todayIso, count: 7 }]);
  });
});
