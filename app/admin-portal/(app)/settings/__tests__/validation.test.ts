import { describe, expect, it } from "vitest";
import { normalizeHandle, validateReservedHandle } from "../validation";

describe("normalizeHandle", () => {
  it("lowercases, trims, and strips a leading @", () => {
    expect(normalizeHandle("  @Checkout ")).toBe("checkout");
  });
});

describe("validateReservedHandle", () => {
  it("rejects an empty value", () => {
    const result = validateReservedHandle("   ", []);
    expect(result.ok).toBe(false);
  });

  it("rejects handles that are too short", () => {
    expect(validateReservedHandle("ab", []).ok).toBe(false);
  });

  it("rejects invalid characters", () => {
    expect(validateReservedHandle("bad handle!", []).ok).toBe(false);
    expect(validateReservedHandle("has-hyphen", []).ok).toBe(false);
  });

  it("rejects duplicates case-insensitively", () => {
    expect(validateReservedHandle("ADMIN", ["admin"]).ok).toBe(false);
  });

  it("accepts and normalizes a valid handle", () => {
    expect(validateReservedHandle("@Checkout", ["admin"])).toEqual({
      ok: true,
      handle: "checkout",
    });
  });
});
