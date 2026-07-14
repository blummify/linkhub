import { describe, expect, it } from "vitest";
import { usersToCsv } from "../csv";
import type { AdminUser } from "../services/types";

function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "usr_1",
    name: "Joel Osei",
    email: "joel@x.com",
    handle: "@joelosei",
    plan: "pro",
    status: "active",
    links: 15,
    views30d: 8420,
    country: "GH",
    joinedAt: "2026-05-24T00:00:00.000Z",
    lastActiveAt: null,
    ...overrides,
  };
}

describe("usersToCsv", () => {
  it("writes a header row and one row per user", () => {
    const csv = usersToCsv([user()]);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "Name,Email,Handle,Plan,Status,Links,Views 30d,Country,Joined,Last active"
    );
    expect(lines[1]).toBe(
      "Joel Osei,joel@x.com,@joelosei,pro,active,15,8420,GH,2026-05-24T00:00:00.000Z,"
    );
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    const csv = usersToCsv([user({ name: 'Ama "The Builder", Jr.\nSecond' })]);
    expect(csv.split("\r\n")[1]).toContain('"Ama ""The Builder"", Jr.\nSecond"');
  });

  it("handles an empty selection", () => {
    expect(usersToCsv([]).split("\r\n")).toHaveLength(1);
  });
});
