import { describe, expect, it } from "vitest";
import { isNavItemActive, NAV_GROUPS } from "../nav";

describe("nav", () => {
  it("groups the platform, business, and system sections", () => {
    expect(NAV_GROUPS.map((g) => g.label)).toEqual(["Platform", "Business", "System"]);
  });

  it("marks the exact route and its subpaths active", () => {
    expect(isNavItemActive("/users", "/users")).toBe(true);
    expect(isNavItemActive("/users/usr_1", "/users")).toBe(true);
  });

  it("does not match unrelated or prefix-colliding routes", () => {
    expect(isNavItemActive("/dashboard", "/users")).toBe(false);
    expect(isNavItemActive("/users-archive", "/users")).toBe(false);
  });
});
