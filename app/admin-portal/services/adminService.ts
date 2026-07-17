/**
 * Admin data service. The users surface (list, detail, every mutation) and the
 * audit log are backed by the real API under `/api/admin/*`; mutation errors
 * surface the server's message. Overview, reports, pages, plans, and settings
 * still serve mock data, and impersonation is a stub until the session-swap
 * feature exists.
 */

import {MOCK_OVERVIEW, MOCK_PAGES, MOCK_PLAN_SNAPSHOT, MOCK_REPORTS, MOCK_SETTINGS, MOCK_TEAM_MEMBERS} from "./mockData";

import type {
  ActionResult,
  AdminPageDetail,
  AdminPageListItem,
  AdminService,
  AdminUserDetail,
  AuditPage,
  AuditQuery,
  PlanAdminSnapshot,
  OverviewMetrics,
  PlatformSettings,
  Report,
  PageFilter,
  PagePage,
  PageQuery,
  PageSort,
  ReportStatus,
  UserPage,
  UserQuery,
} from "./types";

const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_PAGE_SORT: PageSort = "newest";

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

function toPageRow(page: AdminPageDetail): AdminPageListItem {
  return {
    id: page.id,
    handle: page.handle,
    owner: page.owner,
    url: page.url,
    status: page.status,
    links: page.links,
    views30d: page.views30d,
    reports: page.reports,
    createdAt: page.createdAt,
    theme: page.theme,
  };
}

function matchesPageFilter(page: AdminPageDetail, filter: PageFilter): boolean {
  return filter === "all" || page.status === filter;
}

function matchesPageSearch(page: AdminPageDetail, search: string): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    page.handle.toLowerCase().includes(needle) ||
    page.owner.name.toLowerCase().includes(needle) ||
    page.owner.handle.toLowerCase().includes(needle)
  );
}

function sortPages(pages: AdminPageDetail[], sort: PageSort): AdminPageDetail[] {
  const copy = [...pages];
  copy.sort((left, right) => comparePages(left, right, sort));
  return copy;
}

function comparePages(left: AdminPageDetail, right: AdminPageDetail, sort: PageSort): number {
  switch (sort) {
    case "newest":
      return right.createdAt.localeCompare(left.createdAt);
    case "oldest":
      return left.createdAt.localeCompare(right.createdAt);
    case "views_desc":
      return right.views30d - left.views30d;
    case "views_asc":
      return left.views30d - right.views30d;
    case "reports_desc":
      return right.reports - left.reports;
    case "links_desc":
      return right.links - left.links;
  }
  return 0;
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

  listPages(query: PageQuery = {}): Promise<PagePage> {
    const filter = query.filter ?? "all";
    const search = query.search ?? "";
    const sort = query.sort ?? DEFAULT_PAGE_SORT;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const matched = sortPages(
      MOCK_PAGES.filter((page) => matchesPageFilter(page, filter) && matchesPageSearch(page, search)),
      sort
    );
    const total = matched.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, query.page ?? 1), lastPage);
    const start = (page - 1) * pageSize;
    const pages = matched.slice(start, start + pageSize).map(toPageRow);

    return resolve({ pages, total, page, pageSize, sort });
  },

  getPage(id: string): Promise<AdminPageDetail | null> {
    return resolve(MOCK_PAGES.find((page) => page.id === id) ?? null);
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

  getPlans(): Promise<PlanAdminSnapshot> {
    return resolve(structuredClone(MOCK_PLAN_SNAPSHOT));
  },

  getSettings(): Promise<PlatformSettings> {
    return resolve(MOCK_SETTINGS);
  },

  suspendUser: (id) => patchUser(id, { action: "suspend" }),
  unsuspendUser: (id) => patchUser(id, { action: "unsuspend" }),
  changeUserPlan: (id, plan) => patchUser(id, { action: "changePlan", plan }),
  sendPasswordReset: (id) => patchUser(id, { action: "sendReset" }),
  deleteUser: (id) =>
    mutateUser(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // Stub until the impersonation session-swap feature exists.
  impersonateUser: () => resolve({ ok: true } as const),
  // Mock until the pages/plans/settings/moderation surfaces get real backends.
  suspendPage: () => resolve({ ok: true } as const),
  takeDownPage: () => resolve({ ok: true } as const),
  actOnReport: () => resolve({ ok: true } as const),
  listTeamMembers: () => resolve(MOCK_TEAM_MEMBERS),
  inviteTeamMember: () => resolve({ ok: true } as const),
  changeTeamMemberRole: () => resolve({ ok: true } as const),
  removeTeamMember: () => resolve({ ok: true } as const),
  updateGeneralSettings: () => resolve({ ok: true } as const),
  updateSafetySettings: () => resolve({ ok: true } as const),
  addReservedHandle: () => resolve({ ok: true } as const),
  removeReservedHandle: () => resolve({ ok: true } as const),
  setMaintenanceMode: () => resolve({ ok: true } as const),
  purgeCdnCache: () => resolve({ ok: true } as const),
};