import { describe, expect, it } from "vitest";
import { parseClicks, sumClicks, formatClicks, fillSeries, buildClicksSeries } from "@/lib/clicks";

/** UTC-midnight date `n` days before today, matching fillSeries' day axis. */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

describe("parseClicks", () => {
  it("parses a plain numeric string", () => {
    expect(parseClicks("1240")).toBe(1240);
  });

  it("strips comma separators from display strings", () => {
    expect(parseClicks("1,240")).toBe(1240);
    expect(parseClicks("12,345,678")).toBe(12345678);
  });

  it("accepts numbers directly", () => {
    expect(parseClicks(57)).toBe(57);
  });

  it("returns 0 for zero, empty, or non-numeric values", () => {
    expect(parseClicks("0")).toBe(0);
    expect(parseClicks("")).toBe(0);
    expect(parseClicks("abc")).toBe(0);
    expect(parseClicks(-5)).toBe(0);
  });
});

describe("sumClicks", () => {
  it("sums clicks across links", () => {
    expect(sumClicks([{ clicks: "100" }, { clicks: "200" }])).toBe(300);
  });

  it("handles comma strings and zeros", () => {
    expect(sumClicks([{ clicks: "1,200" }, { clicks: "0" }, { clicks: "50" }])).toBe(1250);
  });

  it("returns 0 for no links", () => {
    expect(sumClicks([])).toBe(0);
  });
});

describe("formatClicks", () => {
  it("formats with thousands separators", () => {
    expect(formatClicks(1234)).toBe("1,234");
    expect(formatClicks(0)).toBe("0");
  });

  it("clamps negatives to 0", () => {
    expect(formatClicks(-10)).toBe("0");
  });
});

describe("fillSeries", () => {
  it("returns a fixed-length array of the requested size", () => {
    expect(fillSeries([], 7)).toHaveLength(7);
    expect(fillSeries([], 30)).toHaveLength(30);
  });

  it("returns all zeros when there are no rows", () => {
    expect(fillSeries([], 7)).toEqual(new Array(7).fill(0));
  });

  it("places today's count in the last (newest) slot", () => {
    const series = fillSeries([{ day: daysAgo(0), count: 5 }], 7);
    expect(series).toEqual([0, 0, 0, 0, 0, 0, 5]);
  });

  it("places the oldest in-window day in the first slot", () => {
    const series = fillSeries([{ day: daysAgo(6), count: 3 }], 7);
    expect(series[0]).toBe(3);
    expect(series.slice(1)).toEqual(new Array(6).fill(0));
  });

  it("fills gaps between days with zeros, oldest -> newest", () => {
    const series = fillSeries(
      [
        { day: daysAgo(6), count: 1 },
        { day: daysAgo(3), count: 4 },
        { day: daysAgo(0), count: 2 },
      ],
      7
    );
    expect(series).toEqual([1, 0, 0, 4, 0, 0, 2]);
  });

  it("ignores rows outside the window", () => {
    expect(fillSeries([{ day: daysAgo(30), count: 99 }], 7)).toEqual(new Array(7).fill(0));
  });

  it("aggregates multiple rows on the same day", () => {
    const series = fillSeries(
      [
        { day: daysAgo(0), count: 2 },
        { day: daysAgo(0), count: 3 },
      ],
      7
    );
    expect(series[6]).toBe(5);
  });

  it("accepts ISO date strings", () => {
    const series = fillSeries([{ day: daysAgo(0).toISOString(), count: 7 }], 7);
    expect(series[6]).toBe(7);
  });

  it("returns an empty array for zero days", () => {
    expect(fillSeries([{ day: daysAgo(0), count: 5 }], 0)).toEqual([]);
  });
});

describe("buildClicksSeries", () => {
  it("returns an array of the requested length", () => {
    expect(buildClicksSeries(100, 7)).toHaveLength(7);
    expect(buildClicksSeries(100, 30)).toHaveLength(30);
  });

  it("sums back to exactly the total", () => {
    for (const total of [1, 7, 30, 99, 1240, 50000]) {
      for (const days of [7, 30]) {
        const series = buildClicksSeries(total, days);
        expect(series.reduce((s, v) => s + v, 0)).toBe(total);
      }
    }
  });

  it("is deterministic for the same inputs", () => {
    expect(buildClicksSeries(1240, 30)).toEqual(buildClicksSeries(1240, 30));
  });

  it("produces only non-negative integers", () => {
    const series = buildClicksSeries(523, 30);
    expect(series.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
  });

  it("returns all zeros for a zero total", () => {
    expect(buildClicksSeries(0, 7)).toEqual(new Array(7).fill(0));
  });

  it("returns an empty array for zero days", () => {
    expect(buildClicksSeries(100, 0)).toEqual([]);
  });
});
