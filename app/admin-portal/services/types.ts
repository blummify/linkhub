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

/** Filter tabs on the Users table. */
export type UserFilter = "all" | "pro" | "free" | "suspended";

/** Actions available on a moderation report. */
export type ReportAction = "review" | "takedown" | "warn" | "dismiss";

/** Result of a mutation against the admin service. */
export interface ActionResult {
  ok: true;
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

export interface AdminUserDetail extends AdminUser {
  usage: UsageMetric[];
  recentActivity: ActivityItem[];
}

export interface UserQuery {
  search?: string;
  filter?: UserFilter;
  page?: number;
  pageSize?: number;
}

export interface UserPage {
  users: AdminUser[];
  /** Total users matching the query (before pagination). */
  total: number;
  page: number;
  pageSize: number;
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

/** Kinds of admin actions the audit log records. */
export type AuditActionType =
  | "user_suspended"
  | "user_reinstated"
  | "page_takedown"
  | "impersonation"
  | "password_reset"
  | "plan_changed"
  | "payment_refunded"
  | "report_dismissed"
  | "settings_updated";

/** Preset windows for the audit log's date-range filter. */
export type AuditDateRange = "24h" | "7d" | "30d" | "all";

export interface AuditActor {
  id: string;
  name: string;
  role: string;
}

/** A single before/after field change, shown in the entry detail modal. */
export interface AuditChange {
  field: string;
  before: string;
  after: string;
}

export interface AuditLogEntry {
  id: string;
  actor: AuditActor;
  actionType: AuditActionType;
  actionLabel: string;
  target: string;
  /** Flags actions with real user/data impact (suspensions, takedowns, impersonation, ...). */
  sensitive: boolean;
  ip: string;
  /** ISO datetime string. */
  createdAt: string;
}

export interface AuditLogEntryDetail extends AuditLogEntry {
  session: string;
  /** Present for actions justified by a reason (suspend, takedown, refund, ...). */
  reason?: string;
  /** Present for actions that changed a record's fields (plan, settings, ...). */
  changes?: AuditChange[];
}

export interface AuditLogQuery {
  search?: string;
  /** "all" or an `AuditActor["id"]`. */
  actorId?: string;
  actionType?: AuditActionType | "all";
  range?: AuditDateRange;
  page?: number;
  pageSize?: number;
}

export interface AuditLogPage {
  entries: AuditLogEntry[];
  /** Total entries matching the query (before pagination). */
  total: number;
  page: number;
  pageSize: number;
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
  listReports(status?: ReportStatus): Promise<Report[]>;
  suspendUser(id: string): Promise<ActionResult>;
  deleteUser(id: string): Promise<ActionResult>;
  impersonateUser(id: string): Promise<ActionResult>;
  changeUserPlan(id: string, plan: Plan): Promise<ActionResult>;
  sendPasswordReset(id: string): Promise<ActionResult>;
  actOnReport(id: string, action: ReportAction): Promise<ActionResult>;
  listAuditLog(query?: AuditLogQuery): Promise<AuditLogPage>;
  getAuditLogEntry(id: string): Promise<AuditLogEntryDetail | null>;
  /** Full filtered set, unpaginated — backs CSV export. */
  exportAuditLog(query?: AuditLogQuery): Promise<AuditLogEntry[]>;
}
