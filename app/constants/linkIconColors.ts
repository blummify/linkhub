/** Platforms with a dedicated icon style — colors live in CSS (`pp-link-icon--*` / `dp-link-icon--*`), never inline. */
export const LINK_ICON_KEYS = ["website", "instagram", "youtube", "twitter", "spotify"] as const;

export type LinkIconKey = (typeof LINK_ICON_KEYS)[number];

export function isLinkIconKey(key: string | null | undefined): key is LinkIconKey {
  return key !== null && key !== undefined && (LINK_ICON_KEYS as readonly string[]).includes(key);
}
