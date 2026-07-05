import { describe, expect, it } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("joins truthy string and number values", () => {
    expect(cn("a", "b", 0, 1)).toBe("a b 1");
  });

  it("skips falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("applies object keys whose values are truthy", () => {
    expect(cn("base", { active: true, disabled: false, hidden: undefined })).toBe(
      "base active"
    );
  });

  it("flattens nested arrays", () => {
    expect(cn("a", ["b", ["c", false], { d: true }])).toBe("a b c d");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });
});
