import { describe, expect, it } from "vitest";
import { parseClicks, sumClicks, formatClicks, buildClicksSeries } from "@/lib/clicks";

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

  it("handles total smaller than the number of days", () => {
    const series = buildClicksSeries(3, 7);
    expect(series).toHaveLength(7);
    expect(series.reduce((s, v) => s + v, 0)).toBe(3);
  });

  it("returns all zeros for a zero total", () => {
    expect(buildClicksSeries(0, 7)).toEqual(new Array(7).fill(0));
  });

  it("returns an empty array for zero days", () => {
    expect(buildClicksSeries(100, 0)).toEqual([]);
  });
});
