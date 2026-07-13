import { beforeEach, describe, expect, it, vi } from "vitest";

const { invalidatePublicProfileCache } = vi.hoisted(() => ({
  invalidatePublicProfileCache: vi.fn(async () => {}),
}));
vi.mock("@/lib/publicProfile", () => ({ invalidatePublicProfileCache }));

const { issuePasswordReset } = vi.hoisted(() => ({
  issuePasswordReset: vi.fn(async () => {}),
}));
vi.mock("@/lib/passwordReset", () => ({ issuePasswordReset }));

import {
  changeAdminUserPlan,
  deleteAdminUser,
  sendAdminPasswordReset,
  suspendAdminUser,
  unsuspendAdminUser,
  type AdminActionClient,
} from "../adminUserActions";

const findUnique = vi.fn();
const updateMany = vi.fn();
const userDelete = vi.fn();
const upsert = vi.fn();
const auditCreate = vi.fn();
const $transaction = vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations));

const client = {
  user: { findUnique, updateMany, delete: userDelete },
  subscription: { upsert },
  adminAuditLog: { create: auditCreate },
  $transaction,
} as unknown as AdminActionClient;

const ACTOR = { id: "adm_1", email: "staff@linkhub.app" };

function target(overrides: Record<string, unknown> = {}) {
  return {
    id: "usr_1",
    email: "joel@x.com",
    name: "Joel",
    role: "USER",
    suspendedAt: null,
    profile: { handle: "joel" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue(target());
});

describe("target guards (all actions)", () => {
  it("returns 404 for an unknown user", async () => {
    findUnique.mockResolvedValue(null);
    for (const act of [
      () => suspendAdminUser(client, ACTOR, "nope"),
      () => unsuspendAdminUser(client, ACTOR, "nope"),
      () => deleteAdminUser(client, ACTOR, "nope"),
      () => changeAdminUserPlan(client, ACTOR, "nope", "pro"),
      () => sendAdminPasswordReset(client, ACTOR, "nope"),
    ]) {
      expect(await act()).toEqual({ ok: false, status: 404, error: "User not found" });
    }
    expect($transaction).not.toHaveBeenCalled();
  });

  it("refuses SUPER_ADMIN targets with 403", async () => {
    findUnique.mockResolvedValue(target({ role: "SUPER_ADMIN" }));
    for (const act of [
      () => suspendAdminUser(client, ACTOR, "usr_1"),
      () => unsuspendAdminUser(client, ACTOR, "usr_1"),
      () => deleteAdminUser(client, ACTOR, "usr_1"),
      () => changeAdminUserPlan(client, ACTOR, "usr_1", "pro"),
      () => sendAdminPasswordReset(client, ACTOR, "usr_1"),
    ]) {
      const outcome = await act();
      expect(outcome).toMatchObject({ ok: false, status: 403 });
    }
    expect($transaction).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });
});

describe("suspendAdminUser", () => {
  it("suspends transactionally with an audit entry and takes the page offline", async () => {
    const outcome = await suspendAdminUser(client, ACTOR, "usr_1");
    expect(outcome).toEqual({ ok: true });

    // Guarded update preserves the original suspension timestamp on repeats.
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "usr_1", suspendedAt: null },
      data: { suspendedAt: expect.any(Date) },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "adm_1",
        actorEmail: "staff@linkhub.app",
        action: "user.suspend",
        targetUserId: "usr_1",
        targetEmail: "joel@x.com",
      }),
    });
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(invalidatePublicProfileCache).toHaveBeenCalledWith("joel");
  });
});

describe("unsuspendAdminUser", () => {
  it("clears the suspension, audits, and restores the page", async () => {
    findUnique.mockResolvedValue(target({ suspendedAt: new Date() }));
    const outcome = await unsuspendAdminUser(client, ACTOR, "usr_1");
    expect(outcome).toEqual({ ok: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "usr_1" },
      data: { suspendedAt: null },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "user.unsuspend" }),
    });
    expect(invalidatePublicProfileCache).toHaveBeenCalledWith("joel");
  });
});

describe("deleteAdminUser", () => {
  it("deletes with an audit entry that survives the cascade", async () => {
    const outcome = await deleteAdminUser(client, ACTOR, "usr_1");
    expect(outcome).toEqual({ ok: true });
    expect(userDelete).toHaveBeenCalledWith({ where: { id: "usr_1" } });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "user.delete",
        targetEmail: "joel@x.com",
        metadata: { name: "Joel" },
      }),
    });
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(invalidatePublicProfileCache).toHaveBeenCalledWith("joel");
  });
});

describe("changeAdminUserPlan", () => {
  it("upserts the subscription and audits the new plan", async () => {
    const outcome = await changeAdminUserPlan(client, ACTOR, "usr_1", "business");
    expect(outcome).toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledWith({
      where: { userId: "usr_1" },
      create: { userId: "usr_1", planId: "business" },
      update: { planId: "business" },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "user.changePlan", metadata: { plan: "business" } }),
    });
  });
});

describe("sendAdminPasswordReset", () => {
  it("issues a reset and audits it", async () => {
    const outcome = await sendAdminPasswordReset(client, ACTOR, "usr_1");
    expect(outcome).toEqual({ ok: true });
    expect(issuePasswordReset).toHaveBeenCalledWith(client, {
      id: "usr_1",
      email: "joel@x.com",
      name: "Joel",
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "user.sendReset" }),
    });
  });

  it("rejects accounts without an email address", async () => {
    findUnique.mockResolvedValue(target({ email: null }));
    const outcome = await sendAdminPasswordReset(client, ACTOR, "usr_1");
    expect(outcome).toEqual({ ok: false, status: 400, error: "User has no email address" });
    expect(issuePasswordReset).not.toHaveBeenCalled();
  });
});
