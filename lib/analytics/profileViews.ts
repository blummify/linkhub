import { createHash } from "crypto";
import { redis } from "@/lib/redis";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import { incrementMetric } from "./analytics";
import { isBotUserAgent } from "./botUserAgents";
import { detectDeviceType } from "./device";
import { normalizeReferrer } from "./referrer";
import { UNKNOWN_COUNTRY } from "./dimensions";

const DEDUP_TTL = 1800; // 30 minutes — a visitor reloading within this window counts once

interface RecordProfileViewInput {
  userId: string;
  userAgent: string | null;
  ip: string | null;
  referrer: string | null;
  country: string | null;
}

/**
 * Records one public-profile-page view, unless the visitor is a known bot/crawler or has
 * already been counted within the dedup window. Never throws — a tracking failure must
 * never affect the page response.
 */
export async function recordProfileView({ userId, userAgent, ip, referrer, country }: RecordProfileViewInput): Promise<void> {
  if (isBotUserAgent(userAgent)) return;

  // IP+UA fingerprint — a coarse "same visitor" heuristic. Visitors behind a shared IP
  // (office NAT, mobile carrier CGNAT) can collapse into one fingerprint and undercount;
  // accepted limitation, not something this dedup is meant to solve precisely.
  const fingerprint = createHash("sha256")
    .update(`${ip ?? ""}:${userAgent ?? ""}`)
    .digest("hex")
    .slice(0, 20);
  const dedupKey = `view-seen:${userId}:${fingerprint}`;

  let alreadySeen = false;
  try {
    const result = await redis.set(dedupKey, "1", { ex: DEDUP_TTL, nx: true });
    alreadySeen = result === null;
  } catch {
    // Redis unavailable — fail open, still record the view.
    alreadySeen = false;
  }

  if (alreadySeen) return;

  const device = detectDeviceType(userAgent);
  const source = normalizeReferrer(referrer);
  const countryDim = country ?? UNKNOWN_COUNTRY;

  await Promise.all([
    incrementMetric(userId, ANALYTICS_METRIC.PROFILE_VIEW, device),
    incrementMetric(userId, ANALYTICS_METRIC.PROFILE_VIEW, source),
    incrementMetric(userId, ANALYTICS_METRIC.PROFILE_VIEW, countryDim),
  ]);
}
