import { db } from "@/lib/db";
import { postly } from "@/lib/postly";
import { getMetricTotal } from "@/lib/analytics/analytics";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";

const LINK_THRESHOLDS = [10, 50, 100, 500, 1000] as const;
const PROFILE_THRESHOLDS = [100, 500, 1000] as const;

async function isAlreadySent(entityType: string, entityId: string, threshold: number): Promise<boolean> {
  const row = await db.milestone.findUnique({
    where: { entityType_entityId_threshold: { entityType, entityId, threshold } },
    select: { id: true },
  });
  return row !== null;
}

async function recordMilestone(
  userId: string,
  entityType: string,
  entityId: string,
  threshold: number
): Promise<void> {
  await db.milestone.create({ data: { userId, entityType, entityId, threshold } });
}

export async function checkLinkMilestone(linkId: string, userId: string): Promise<void> {
  const link = await db.link.findUnique({
    where: { id: linkId },
    select: { clicks: true, title: true, url: true },
  });

  if (!link || typeof link.clicks !== "number") return;

  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (!user?.email) return;

  for (const threshold of LINK_THRESHOLDS) {
    if (link.clicks < threshold) break;
    if (await isAlreadySent("link", linkId, threshold)) continue;

    try {
      await postly.send({
        template: process.env.POSTLY_TEMPLATE_CLICK_MILESTONE!,
        to: [user.email],
        data: {
          name: user.name ?? "there",
          linkTitle: link.title,
          threshold,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/my-account`,
        },
      });
      await recordMilestone(userId, "link", linkId, threshold);
    } catch (error) {
      console.error("Error sending click milestone email:", error);
    }
  }
}

export async function checkProfileMilestone(userId: string): Promise<void> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) return;

  const [totalViews, user] = await Promise.all([
    getMetricTotal(userId, ANALYTICS_METRIC.PROFILE_VIEW),
    db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
  ]);

  if (!user?.email) return;

  for (const threshold of PROFILE_THRESHOLDS) {
    if (totalViews < threshold) break;
    if (await isAlreadySent("profile", profile.id, threshold)) continue;

    try {
      await postly.send({
        template: process.env.POSTLY_TEMPLATE_PROFILE_MILESTONE!,
        to: [user.email],
        data: {
          name: user.name ?? "there",
          threshold,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/my-account`,
        },
      });
      await recordMilestone(userId, "profile", profile.id, threshold);
    } catch (error) {
      console.error("Error sending profile milestone email:", error);
    }
  }
}
