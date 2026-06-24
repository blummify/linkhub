import { describe, it, expect } from "vitest";
import { isReservedHandle, HANDLE_REGEX } from "../reservedHandles";

describe("isReservedHandle", () => {
  it("blocks known app route segments", () => {
    expect(isReservedHandle("billing")).toBe(true);
    expect(isReservedHandle("branding")).toBe(true);
    expect(isReservedHandle("login")).toBe(true);
    expect(isReservedHandle("user-dashboard")).toBe(true);
  });

  it("blocks generic reserved words", () => {
    expect(isReservedHandle("admin")).toBe(true);
    expect(isReservedHandle("api")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isReservedHandle("Billing")).toBe(true);
    expect(isReservedHandle("LOGIN")).toBe(true);
  });

  it("allows ordinary handles", () => {
    expect(isReservedHandle("joelosei")).toBe(false);
    expect(isReservedHandle("jane_doe")).toBe(false);
  });
});

describe("HANDLE_REGEX", () => {
  it("accepts 3-24 alphanumeric/underscore characters", () => {
    expect(HANDLE_REGEX.test("abc")).toBe(true);
    expect(HANDLE_REGEX.test("a".repeat(24))).toBe(true);
  });

  it("rejects too short, too long, or invalid characters", () => {
    expect(HANDLE_REGEX.test("ab")).toBe(false);
    expect(HANDLE_REGEX.test("a".repeat(25))).toBe(false);
    expect(HANDLE_REGEX.test("joel-osei")).toBe(false);
    expect(HANDLE_REGEX.test("joel osei")).toBe(false);
  });
});
