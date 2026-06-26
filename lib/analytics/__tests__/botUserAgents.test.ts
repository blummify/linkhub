import { describe, it, expect } from "vitest";
import { isBotUserAgent } from "../botUserAgents";

describe("isBotUserAgent", () => {
  it("returns true for known crawlers", () => {
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBotUserAgent("Twitterbot/1.0")).toBe(true);
    expect(isBotUserAgent("Slackbot-LinkExpanding 1.0")).toBe(true);
  });

  it("returns false for a real browser user agent", () => {
    expect(
      isBotUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      )
    ).toBe(false);
  });

  it("treats a missing or empty user agent as not a bot", () => {
    expect(isBotUserAgent(null)).toBe(false);
    expect(isBotUserAgent("")).toBe(false);
  });
});
