import { SOURCE_DIMENSIONS, type SourceDimension } from "./dimensions";

const HOSTNAME_MAP: Record<string, SourceDimension> = {
  "instagram.com": "instagram",
  "l.instagram.com": "instagram",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
  "whatsapp.com": "whatsapp",
  "wa.me": "whatsapp",
  "linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
};

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/**
 * Classifies a Referer header into one of SOURCE_DIMENSIONS. Missing, invalid,
 * or same-origin (`ownOrigin`) referrers resolve to "direct" — matching how
 * every analytics tool treats a visitor with no external referrer. Recognized
 * hosts (and their subdomains) map to a known source; anything else is "other".
 */
export function normalizeReferrer(referrer: string | null, ownOrigin?: string): SourceDimension {
  if (!referrer) return "direct";

  let hostname: string;
  try {
    hostname = stripWww(new URL(referrer).hostname);
  } catch {
    return "other";
  }

  if (ownOrigin) {
    try {
      if (hostname === stripWww(new URL(ownOrigin).hostname)) return "direct";
    } catch {
      // malformed ownOrigin — ignore, fall through to host matching
    }
  }

  for (const [suffix, source] of Object.entries(HOSTNAME_MAP)) {
    if (hostname === suffix || hostname.endsWith(`.${suffix}`)) return source;
  }

  return (SOURCE_DIMENSIONS as readonly string[]).includes(hostname) ? (hostname as SourceDimension) : "other";
}
