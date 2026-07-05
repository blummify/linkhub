import { describe, expect, it } from "vitest";
import { readEnvironment } from "../environment";

describe("readEnvironment", () => {
  it("reads a known environment name and applies its default label", () => {
    expect(readEnvironment({ name: "staging" })).toEqual({
      name: "staging",
      label: "Staging",
    });
  });

  it("normalizes casing and surrounding whitespace", () => {
    expect(readEnvironment({ name: "  Production  " })).toEqual({
      name: "production",
      label: "Production",
    });
  });

  it("honours an explicit label override", () => {
    expect(readEnvironment({ name: "development", label: "Local dev" })).toEqual({
      name: "development",
      label: "Local dev",
    });
  });

  it("falls back to production when the value is unset or unrecognised", () => {
    expect(readEnvironment({ name: undefined })).toEqual({
      name: "production",
      label: "Production",
    });
    expect(readEnvironment({ name: "qa" })).toEqual({
      name: "production",
      label: "Production",
    });
  });
});
