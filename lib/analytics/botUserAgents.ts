import { isbot } from "isbot";

/**
 * Detects bots/crawlers/social-unfurlers (Googlebot, Twitterbot, Slackbot, etc.) via the
 * `isbot` package's maintained pattern list, rather than a hand-rolled regex that would
 * silently go stale as new crawlers appear. A missing/empty User-Agent is NOT treated as
 * a bot — privacy-conscious real browsers can strip it.
 */
export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return isbot(userAgent);
}
