/**
 * Domain types for the admin surface. Status-like fields are modelled as
 * discriminated string unions so invalid states are unrepresentable and the UI
 * can map each case exhaustively.
 */

export type Plan = "free" | "pro" | "business";
export type UserStatus = "active" | "suspended" | "pending";
export type ReportSeverity = "high" | "medium";
export type ReportCategory = "phishing" | "spam" | "scam";
export type ReportStatus = "open" | "reviewing" | "resolved";
export type SystemStatus = "operational" | "degraded" | "down";
export type TrendDirection = "up" | "down" | "flat";
export type PageStatus = "live" | "flagged" | "suspended";
export type PageFilter = "all" | PageStatus;
export type PageSort =
  | "newest"
  | "oldest"
  | "views_desc"
  | "views_asc"
  | "reports_desc"
  | "links_desc";

/** Filter tabs on the Users table. */
export type UserFilter = "all" | "pro" | "free" | "business" | "suspended" | "unverified";

/** Columns the Users table can sort by, server-side. */
export type UserSort = "name" | "links" | "views" | "joined";

export type SortDirection = "asc" | "desc";

/** Actions available on a moderation report. */
export type ReportAction = "review" | "takedown" | "warn" | "dismiss";

/** Result of a mutation against the admin service. */
export interface ActionResult {
  ok: true;
}

export interface PageOwner {
  id: string;
  name: string;
  handle: string;
}

export interface PublishedPageLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
}

export interface PageReportHistoryItem {
  id: string;
  reporter: string;
  reason: ReportCategory;
  status: ReportStatus;
  reportedAt: string;
}

export interface AdminPageListItem {
  id: string;
  handle: string;
  owner: PageOwner;
  url: string;
  status: PageStatus;
  links: number;
  views30d: number;
  reports: number;
  createdAt: string;
  theme: string;
}

export interface AdminPageDetail extends AdminPageListItem {
  publishedLinks: PublishedPageLink[];
  reportHistory: PageReportHistoryItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  plan: Plan;
  status: UserStatus;
  links: number;
  views30d: number;
  country: string;
  /** ISO date string. */
  joinedAt: string;
  /** ISO date string, or null when the user has never been active. */
  lastActiveAt: string | null;
}

export interface UsageMetric {
  label: string;
  used: number;
  limit: number;
  /** Human-readable form, e.g. "8.4k / 50k" or "410MB / 1GB". */
  display: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
}

export interface BillingCard {
  brand: string;
  last4: string;
  /** e.g. "12/27"; null when the processor didn't report one. */
  expiry: string | null;
}

export interface BillingInfo {
  plan: Plan;
  /** Subscription status as stored (e.g. "active", "cancelled"). */
  status: string;
  /** ISO date of the next renewal, or null for free/never-billed accounts. */
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
  card: BillingCard | null;
}

export interface LoginItem {
  id: string;
  /** ISO timestamp of the sign-in. */
  at: string;
  ip: string | null;
  country: string | null;
  userAgent: string | null;
}

export interface SecurityInfo {
  twoFactorEnabled: boolean;
  backupCodesRemaining: number;
  passwordSet: boolean;
  /** OAuth providers linked to the account (e.g. ["google"]). */
  providers: string[];
  emailVerifiedAt: string | null;
  /** Newest first. Empty for accounts that predate login tracking. */
  recentLogins: LoginItem[];
}

export interface AdminUserDetail extends AdminUser {
  usage: UsageMetric[];
  recentActivity: ActivityItem[];
  billing: BillingInfo;
  security: SecurityInfo;
}

export interface UserQuery {
  search?: string;
  filter?: UserFilter;
  page?: number;
  pageSize?: number;
  sort?: UserSort;
  dir?: SortDirection;
}

export interface UserPage {
  users: AdminUser[];
  /** Total users matching the query (before pagination). */
  total: number;
  page: number;
  pageSize: number;
}

export interface PageQuery {
  search?: string;
  filter?: PageFilter;
  sort?: PageSort;
  page?: number;
  pageSize?: number;
}

export interface PagePage {
  pages: AdminPageListItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: PageSort;
}

export type DeltaTone = "positive" | "negative" | "warning" | "neutral";

export interface KpiDelta {
  direction: TrendDirection;
  text: string;
  /** Overrides the colour derived from `direction` (e.g. a warning that isn't a drop). */
  tone?: DeltaTone;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta?: KpiDelta;
  /** Raw series the Sparkline component renders as an inline SVG path. */
  sparkline?: number[];
}

export interface DistributionSlice {
  label: string;
  pct: number;
  tone: "neutral" | "primary" | "purple";
}

export interface SystemComponentStatus {
  name: string;
  status: SystemStatus;
}

export interface SignupItem {
  id: string;
  name: string;
  handle: string;
  plan: Plan;
  when: string;
}

export interface ModerationQueueItem {
  id: string;
  handle: string;
  reason: string;
  reports: number;
  severity: ReportSeverity;
}

export interface OverviewMetrics {
  kpis: Kpi[];
  signupsRevenueSeries: { signups: number[]; revenue: number[] };
  distribution: DistributionSlice[];
  systemStatus: SystemComponentStatus[];
  recentSignups: SignupItem[];
  moderationQueue: ModerationQueueItem[];
}

export interface Report {
  id: string;
  handle: string;
  category: ReportCategory;
  severity: ReportSeverity;
  reportCount: number;
  description: string;
  reporter: string;
  reportedAt: string;
  url: string;
  status: ReportStatus;
}

export interface AuditEntry {
  id: string;
  /** Namespaced action id, e.g. "user.suspend". */
  action: string;
  actorEmail: string | null;
  targetUserId: string | null;
  targetEmail: string | null;
  metadata: Record<string, string> | null;
  /** ISO timestamp. */
  at: string;
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export type PlanInterval = "Monthly" | "Yearly";
export type PlanFeatureScope = "plan" | "rollout";

export interface PlanLimitSet {
  links: string;
  views: string;
  customDomains: string;
  storage: string;
}

export interface PlanEditorDraft {
  price: string;
  interval: PlanInterval;
  linkLimit: string;
  monthlyViews: string;
  customDomains: string;
  storage: string;
  featureToggles: Record<string, boolean>;
}

export interface PlanFeatureFlag {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: PlanFeatureScope;
}

export interface PlanVersionEntry {
  id: string;
  plan: Plan | "all";
  version: string;
  summary: string;
  changedBy: string;
  changedAt: string;
  fields: string[];
}

export interface PlanAuditEntry {
  id: string;
  action: string;
  plan: Plan | "all";
  actor: string;
  details: string;
  timestamp: string;
}

export interface PlanAdminRow {
  plan: Plan;
  tier: string;
  name: string;
  price: string;
  highlighted?: boolean;
  limits: PlanLimitSet;
  features: string[];
  editor: PlanEditorDraft;
}

export interface PlanAdminSnapshot {
  plans: PlanAdminRow[];
  flags: PlanFeatureFlag[];
  versions: PlanVersionEntry[];
  auditLog: PlanAuditEntry[];
}

export type CurrencyCode = "EUR" | "USD" | "GHS";

export interface GeneralSettings {
  defaultCurrency: CurrencyCode;
  supportEmail: string;
}

export interface SafetySettings {
  autoFlagSuspiciousLinks: boolean;
  /** A page is auto-suspended once it reaches this many unique reports. */
  autoSuspendAfterReports: number;
}

export interface SystemSettings {
  maintenanceMode: boolean;
}

export interface PlatformSettings {
  general: GeneralSettings;
  safety: SafetySettings;
  /** Admin-managed handles that can't be claimed (on top of built-in route reservations). */
  reservedHandles: string[];
  system: SystemSettings;
}

/**
 * The typed boundary the admin UI talks to. The current implementation returns
 * in-memory mock data; it can be swapped for server actions later without
 * touching any caller.
 */
export interface AdminService {
  getOverviewMetrics(): Promise<OverviewMetrics>;
  listUsers(query?: UserQuery): Promise<UserPage>;
  getUser(id: string): Promise<AdminUserDetail | null>;
  listPages(query?: PageQuery): Promise<PagePage>;
  getPage(id: string): Promise<AdminPageDetail | null>;
  suspendPage(id: string): Promise<ActionResult>;
  takeDownPage(id: string): Promise<ActionResult>;
  listReports(status?: ReportStatus): Promise<Report[]>;
  listAuditLog(query?: AuditQuery): Promise<AuditPage>;
  suspendUser(id: string): Promise<ActionResult>;
  unsuspendUser(id: string): Promise<ActionResult>;
  deleteUser(id: string): Promise<ActionResult>;
  impersonateUser(id: string): Promise<ActionResult>;
  changeUserPlan(id: string, plan: Plan): Promise<ActionResult>;
  sendPasswordReset(id: string): Promise<ActionResult>;
  actOnReport(id: string, action: ReportAction): Promise<ActionResult>;
  getPlans(): Promise<PlanAdminSnapshot>;

  // Platform settings. Every mutation is audit-logged server-side.
  getSettings(): Promise<PlatformSettings>;
  updateGeneralSettings(input: GeneralSettings): Promise<ActionResult>;
  updateSafetySettings(input: SafetySettings): Promise<ActionResult>;
  addReservedHandle(handle: string): Promise<ActionResult>;
  removeReservedHandle(handle: string): Promise<ActionResult>;
  setMaintenanceMode(enabled: boolean): Promise<ActionResult>;
  purgeCdnCache(): Promise<ActionResult>;
}
