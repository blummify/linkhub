import type { PrismaClient } from "@prisma/client";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import { formatDate, formatNumber } from "@/app/admin-portal/format";
import type { AdminUserDetail } from "@/app/admin-portal/services/types";
import { deriveStatus, toPlan } from "./adminUsers";

/**
 * Full user detail for the admin drawer, assembled from real tables: account
 * facts, plan & billing (Subscription), usage counts, recent activity (Links),
 * and security posture (2FA, backup codes, providers, LoginEvent history).
 * Takes any Prisma-shaped client so tests can inject a stub.
 */

export type AdminDetailClient = Pick<
  PrismaClient,
  "user" | "analytics" | "twoFactorBackupCode" | "loginEvent" | "link"
>;

const RECENT_LOGINS = 5;
const RECENT_ACTIVITY = 8;

export async function getAdminUserDetail(
  client: AdminDetailClient,
  id: string
): Promise<AdminUserDetail | null> {
  const user = await client.user.findUnique({
    where: { id },
    include: {
      profile: { select: { handle: true } },
      subscription: true,
      accounts: { select: { provider: true } },
      _count: { select: { links: true } },
    },
  });
  if (!user) return null;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  const [views, backupCodesRemaining, logins, recentLinks] = await Promise.all([
    client.analytics.aggregate({
      _sum: { count: true },
      where: {
        userId: id,
        metric: ANALYTICS_METRIC.PROFILE_VIEW,
        dimension: "total",
        date: { gte: since },
      },
    }),
    client.twoFactorBackupCode.count({ where: { userId: id, usedAt: null } }),
    client.loginEvent.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: RECENT_LOGINS,
    }),
    client.link.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
      take: RECENT_ACTIVITY,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    }),
  ]);

  const links = user._count.links;
  const views30d = views._sum.count ?? 0;
  const plan = toPlan(user.subscription?.planId ?? "free");
  const subscription = user.subscription;

  return {
    id: user.id,
    name: user.name ?? "—",
    email: user.email ?? "—",
    handle: user.profile?.handle ? `@${user.profile.handle}` : "—",
    plan,
    status: deriveStatus(user),
    links,
    views30d,
    country: user.country ?? "—",
    joinedAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    // No hard plan quotas exist yet, so usage reports plain counts (limit 0).
    usage: [
      { label: "Links", used: links, limit: 0, display: formatNumber(links) },
      { label: "Views 30d", used: views30d, limit: 0, display: formatNumber(views30d) },
    ],
    recentActivity: recentLinks.map((link) => ({
      id: link.id,
      title: link.title,
      // Treat near-identical timestamps as the original creation.
      meta:
        link.updatedAt.getTime() - link.createdAt.getTime() > 60_000
          ? `Link updated · ${formatDate(link.updatedAt.toISOString())}`
          : `Link added · ${formatDate(link.createdAt.toISOString())}`,
    })),
    billing: {
      plan,
      status: subscription?.status ?? "active",
      renewsAt: subscription?.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      card:
        subscription?.cardBrand && subscription.cardLast4
          ? {
              brand: subscription.cardBrand,
              last4: subscription.cardLast4,
              expiry: subscription.cardExpiry ?? null,
            }
          : null,
    },
    security: {
      twoFactorEnabled: user.twoFactorEnabled,
      backupCodesRemaining,
      passwordSet: Boolean(user.passwordHash),
      providers: user.accounts.map((account) => account.provider),
      emailVerifiedAt: user.emailVerified?.toISOString() ?? null,
      recentLogins: logins.map((login) => ({
        id: login.id,
        at: login.createdAt.toISOString(),
        ip: login.ip,
        country: login.country,
        userAgent: login.userAgent,
      })),
    },
  };
}
