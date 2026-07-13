/**
 * Mock implementation of {@link AdminService}. Filtering, search, and
 * pagination run here (as a real backend would) so components stay
 * presentational. Swap this module for server actions later — callers and the
 * interface stay unchanged.
 */

import { MOCK_OVERVIEW, MOCK_PLAN_SNAPSHOT, MOCK_PAGES, MOCK_REPORTS, MOCK_SETTINGS, MOCK_USERS } from "./mockData";
import type {
  AdminPageDetail,
  AdminPageListItem,
  AdminService,
  AdminUser,
  AdminUserDetail,
  PlanAdminSnapshot,
  OverviewMetrics,
  PlatformSettings,
  Report,
  PageFilter,
  PagePage,
  PageQuery,
  PageSort,
  ReportStatus,
  UserFilter,
  UserPage,
  UserQuery,
} from "./types";

const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_PAGE_SORT: PageSort = "newest";

/** Resolve on the next microtask so hooks exercise real loading states. */
function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function toListRow(user: AdminUserDetail): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    plan: user.plan,
    status: user.status,
    links: user.links,
    views30d: user.views30d,
    country: user.country,
    joinedAt: user.joinedAt,
    lastActiveAt: user.lastActiveAt,
  };
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

function matchesFilter(user: AdminUserDetail, filter: UserFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pro":
      return user.plan === "pro";
    case "free":
      return user.plan === "free";
    case "suspended":
      return user.status === "suspended";
  }
}

function matchesSearch(user: AdminUserDetail, search: string): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    user.name.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle) ||
    user.handle.toLowerCase().includes(needle)
  );
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

  listUsers(query: UserQuery = {}): Promise<UserPage> {
    const filter = query.filter ?? "all";
    const search = query.search ?? "";
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const matched = MOCK_USERS.filter(
      (user) => matchesFilter(user, filter) && matchesSearch(user, search)
    );

    const total = matched.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, query.page ?? 1), lastPage);
    const start = (page - 1) * pageSize;
    const users = matched.slice(start, start + pageSize).map(toListRow);

    return resolve({ users, total, page, pageSize });
  },

  getUser(id: string): Promise<AdminUserDetail | null> {
    return resolve(MOCK_USERS.find((user) => user.id === id) ?? null);
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

  getPlans(): Promise<PlanAdminSnapshot> {
    return resolve(structuredClone(MOCK_PLAN_SNAPSHOT));
  },

  getSettings(): Promise<PlatformSettings> {
    return resolve(MOCK_SETTINGS);
  },

  // Mock mutations acknowledge without side effects; a real backend will use the
  // arguments. A no-arg implementation still satisfies the typed signature.
  suspendUser: () => resolve({ ok: true } as const),
  deleteUser: () => resolve({ ok: true } as const),
  impersonateUser: () => resolve({ ok: true } as const),
  changeUserPlan: () => resolve({ ok: true } as const),
  sendPasswordReset: () => resolve({ ok: true } as const),
  suspendPage: () => resolve({ ok: true } as const),
  takeDownPage: () => resolve({ ok: true } as const),
  actOnReport: () => resolve({ ok: true } as const),
  updateGeneralSettings: () => resolve({ ok: true } as const),
  updateSafetySettings: () => resolve({ ok: true } as const),
  addReservedHandle: () => resolve({ ok: true } as const),
  removeReservedHandle: () => resolve({ ok: true } as const),
  setMaintenanceMode: () => resolve({ ok: true } as const),
  purgeCdnCache: () => resolve({ ok: true } as const),
};
