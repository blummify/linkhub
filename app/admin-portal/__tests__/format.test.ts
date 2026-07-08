import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatNumber, summarizeUserAgent } from "../format";

describe("formatDate", () => {
  it("renders an ISO date deterministically", () => {
    expect(formatDate("2026-05-24T00:00:00.000Z")).toBe("24 May 2026");
  });
});

describe("formatDateTime", () => {
  it("includes the UTC time", () => {
    expect(formatDateTime("2026-05-24T14:32:00.000Z")).toBe("24 May 2026, 14:32");
  });
});

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(8420)).toBe("8,420");
  });
});

describe("summarizeUserAgent", () => {
  const chrome =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  it("names the common browsers despite embedded tokens", () => {
    expect(summarizeUserAgent(chrome)).toBe("Chrome");
    expect(summarizeUserAgent(`${chrome} Edg/126.0`)).toBe("Edge");
    expect(summarizeUserAgent(`${chrome} OPR/112.0`)).toBe("Opera");
    expect(
      summarizeUserAgent(
        "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
      )
    ).toBe("Safari");
    expect(summarizeUserAgent("Mozilla/5.0 (X11; Linux) Gecko/20100101 Firefox/127.0")).toBe(
      "Firefox"
    );
  });

  it("truncates unknown agents", () => {
    expect(summarizeUserAgent("curl/8.0")).toBe("curl/8.0");
    expect(summarizeUserAgent("x".repeat(60))).toBe(`${"x".repeat(40)}…`);
  });
});
