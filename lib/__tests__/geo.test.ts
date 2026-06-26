import { describe, it, expect } from "vitest";
import { getClientIp } from "../geo";

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
