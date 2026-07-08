import { describe, it, expect } from "vitest";
import { detectCountryFromHeaders, getClientIp } from "../geo";

function headerGetter(headers: Record<string, string>): (name: string) => string | null {
  return (name: string) => headers[name] ?? null;
}

describe("getClientIp", () => {
  it("takes the first hop from x-forwarded-for", () => {
    const ip = getClientIp(headerGetter({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }));
    expect(ip).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const ip = getClientIp(headerGetter({ "x-real-ip": "3.3.3.3" }));
    expect(ip).toBe("3.3.3.3");
  });

  it("returns null when neither header is present", () => {
    const ip = getClientIp(headerGetter({}));
    expect(ip).toBeNull();
  });
});

describe("detectCountryFromHeaders", () => {
  it("prefers the Vercel geo header, normalised to upper case", () => {
    const country = detectCountryFromHeaders(
      headerGetter({ "x-vercel-ip-country": "gh", "accept-language": "en-US,en;q=0.9" })
    );
    expect(country).toBe("GH");
  });

  it("falls back to the accept-language region", () => {
    const country = detectCountryFromHeaders(headerGetter({ "accept-language": "en-DE,en;q=0.9" }));
    expect(country).toBe("DE");
  });

  it("returns null when nothing identifies a country", () => {
    expect(detectCountryFromHeaders(headerGetter({}))).toBeNull();
  });
});
