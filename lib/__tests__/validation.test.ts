import { describe, expect, it } from "vitest";
import { validateEmail, validatePassword, signupSchema, loginSchema } from "../validation/auth.schema";

describe("validateEmail", () => {
  it("returns empty string for a valid email", () => {
    expect(validateEmail("user@example.com")).toBe("");
  });

  it("returns an error for missing @", () => {
    expect(validateEmail("notanemail")).not.toBe("");
  });

  it("returns an error for missing domain", () => {
    expect(validateEmail("user@")).not.toBe("");
  });

  it("returns an error for empty string", () => {
    expect(validateEmail("")).not.toBe("");
  });
});

describe("validatePassword", () => {
  it("returns empty string for a valid password", () => {
    expect(validatePassword("Password1!")).toBe("");
  });

  it("returns an error when shorter than 6 characters", () => {
    expect(validatePassword("Ab1")).not.toBe("");
  });

  it("returns an error when no uppercase letter", () => {
    expect(validatePassword("password1!")).not.toBe("");
  });

  it("returns an error when no number", () => {
    expect(validatePassword("Password")).not.toBe("");
  });

  it("returns empty string for a long complex password", () => {
    expect(validatePassword("SuperSecret42!")).toBe("");
  });
});

describe("signupSchema", () => {
  const valid = {
    name: "Joel",
    email: "joel@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  it("passes for valid signup data", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when passwords do not match", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });

  it("fails when name is empty", () => {
    expect(signupSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("fails when email is invalid", () => {
    expect(signupSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("passes for valid credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("fails when password is empty", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
