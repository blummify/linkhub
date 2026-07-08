/**
 * Admin data service. The users surface (list, detail, every mutation) and the
 * audit log are backed by the real API under `/api/admin/*`; mutation errors
 * surface the server's message. Overview/reports still serve mock data, and
 * impersonation is a stub until the session-swap feature exists.
 */

import { MOCK_OVERVIEW, MOCK_REPORTS } from "./mockData";
import type {
  ActionResult,
  AdminService,
  AdminUserDetail,
  AuditPage,
  AuditQuery,
  OverviewMetrics,
  Report,
  ReportStatus,
  UserPage,
  UserQuery,
} from "./types";

/** Resolve on the next microtask so hooks exercise real loading states. */
function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

/** Runs a mutation request and throws the server's error message on failure. */
async function mutateUser(path: string, init: RequestInit): Promise<ActionResult> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", accept: "application/json" },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Non-JSON error body — keep the status message.
    }
    throw new Error(message);
  }
  return (await res.json()) as ActionResult;
}

function patchUser(id: string, body: Record<string, string>): Promise<ActionResult> {
  return mutateUser(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export const adminService: AdminService = {
  getOverviewMetrics(): Promise<OverviewMetrics> {
    return resolve(MOCK_OVERVIEW);
  },

  async listUsers(query: UserQuery = {}): Promise<UserPage> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.filter) params.set("filter", query.filter);
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.sort) params.set("sort", query.sort);
    if (query.dir) params.set("dir", query.dir);

    const res = await fetch(`/api/admin/users?${params.toString()}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to load users (HTTP ${res.status})`);
    }
    return (await res.json()) as UserPage;
  },

  async getUser(id: string): Promise<AdminUserDetail | null> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to load user (HTTP ${res.status})`);
    }
    return (await res.json()) as AdminUserDetail;
  },

  listReports(status: ReportStatus = "open"): Promise<Report[]> {
    return resolve(MOCK_REPORTS.filter((report) => report.status === status));
  },

  async listAuditLog(query: AuditQuery = {}): Promise<AuditPage> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));

    const res = await fetch(`/api/admin/audit?${params.toString()}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to load audit log (HTTP ${res.status})`);
    }
    return (await res.json()) as AuditPage;
  },

  suspendUser: (id) => patchUser(id, { action: "suspend" }),
  unsuspendUser: (id) => patchUser(id, { action: "unsuspend" }),
  changeUserPlan: (id, plan) => patchUser(id, { action: "changePlan", plan }),
  sendPasswordReset: (id) => patchUser(id, { action: "sendReset" }),
  deleteUser: (id) =>
    mutateUser(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // Stub until the impersonation session-swap feature exists.
  impersonateUser: () => resolve({ ok: true } as const),
  // Mock until the moderation surface gets its real backend.
  actOnReport: () => resolve({ ok: true } as const),
};
