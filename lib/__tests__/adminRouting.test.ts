import { describe, it, expect } from "vitest";
import {
  ADMIN_PREFIX,
  decideAdminRoute,
  isAdminHost,
  isAdminInternalPath,
} from "../adminRouting";

describe("isAdminHost", () => {
  it("matches the admin subdomain, with or without a port", () => {
    expect(isAdminHost("admin.getlinkhub.app")).toBe(true);
    expect(isAdminHost("admin.localhost:3000")).toBe(true);
  });

  it("rejects the main domain and lookalikes", () => {
    expect(isAdminHost("getlinkhub.app")).toBe(false);
    expect(isAdminHost("www.getlinkhub.app")).toBe(false);
    expect(isAdminHost("notadmin.getlinkhub.app")).toBe(false);
    expect(isAdminHost("")).toBe(false);
  });
});

describe("isAdminInternalPath", () => {
  it("matches the internal rewrite tree only", () => {
    expect(isAdminInternalPath(ADMIN_PREFIX)).toBe(true);
    expect(isAdminInternalPath(`${ADMIN_PREFIX}/login`)).toBe(true);
    expect(isAdminInternalPath(`${ADMIN_PREFIX}/dashboard`)).toBe(true);
    expect(isAdminInternalPath("/admin-portalish")).toBe(false);
    expect(isAdminInternalPath("/login")).toBe(false);
  });
});

describe("decideAdminRoute", () => {
  describe("non-super-admin (anonymous, USER, PRO)", () => {
    it("redirects any non-login path to the admin login", () => {
      expect(decideAdminRoute({ pathname: "/dashboard", isSuperAdmin: false })).toEqual({
        type: "redirect",
        to: "/login",
      });
      expect(decideAdminRoute({ pathname: "/", isSuperAdmin: false })).toEqual({
        type: "redirect",
        to: "/login",
      });
    });

    it("lets the login page through, rewritten into the internal tree", () => {
      expect(decideAdminRoute({ pathname: "/login", isSuperAdmin: false })).toEqual({
        type: "rewrite",
        to: `${ADMIN_PREFIX}/login`,
      });
    });
  });

  describe("authenticated super-admin", () => {
    it("redirects the login page to the dashboard", () => {
      expect(decideAdminRoute({ pathname: "/login", isSuperAdmin: true })).toEqual({
        type: "redirect",
        to: "/dashboard",
      });
    });

    it("rewrites the root to the dashboard", () => {
      expect(decideAdminRoute({ pathname: "/", isSuperAdmin: true })).toEqual({
        type: "rewrite",
        to: `${ADMIN_PREFIX}/dashboard`,
      });
    });

    it("rewrites other paths into the internal tree unchanged", () => {
      expect(decideAdminRoute({ pathname: "/dashboard", isSuperAdmin: true })).toEqual({
        type: "rewrite",
        to: `${ADMIN_PREFIX}/dashboard`,
      });
    });
  });
});
