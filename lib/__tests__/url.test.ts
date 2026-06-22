import { describe, expect, it } from "vitest";
import { normalizeUrl, isValidUrl } from "../url";

describe("normalizeUrl", () => {
  it("prepends https:// to bare domains, leaving the host unchanged", () => {
    expect(normalizeUrl("google.com")).toBe("https://google.com");
    expect(normalizeUrl("www.example.com")).toBe("https://www.example.com");
    expect(normalizeUrl("open.spotify.com")).toBe("https://open.spotify.com");
    expect(normalizeUrl("example.co.uk")).toBe("https://example.co.uk");
  });

  it("appends the most common TLD to a dot-less single label", () => {
    expect(normalizeUrl("google")).toBe("https://google.com");
    expect(normalizeUrl("google/path")).toBe("https://google.com/path");
  });

  it("trims surrounding whitespace before normalizing", () => {
    expect(normalizeUrl("  google.com  ")).toBe("https://google.com");
  });

  it("leaves already-schemed input unchanged (no double scheme)", () => {
    expect(normalizeUrl("http://x.com")).toBe("http://x.com");
    expect(normalizeUrl("https://x.com")).toBe("https://x.com");
    expect(normalizeUrl("mailto:me@x.com")).toBe("mailto:me@x.com");
  });

  it("returns empty input untouched", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });
});

describe("isValidUrl", () => {
  it("accepts bare domains", () => {
    expect(isValidUrl("google.com")).toBe(true);
    expect(isValidUrl("www.example.com")).toBe(true);
    expect(isValidUrl("open.spotify.com")).toBe(true);
    expect(isValidUrl("example.co.uk")).toBe(true);
  });

  it("accepts a dot-less single label (completed to .com)", () => {
    expect(isValidUrl("google")).toBe(true);
  });

  it("accepts schemed URLs", () => {
    expect(isValidUrl("http://x.com")).toBe(true);
    expect(isValidUrl("https://x.com")).toBe(true);
    expect(isValidUrl("mailto:me@x.com")).toBe(true);
  });

  it("rejects empty, whitespace, and multi-word input", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("   ")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects mailto without a target", () => {
    expect(isValidUrl("mailto:")).toBe(false);
  });
});
