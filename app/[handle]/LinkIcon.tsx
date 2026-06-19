import type { ReactNode } from "react";
import Image from "next/image";
import { LINK_ICON_COLORS } from "@/app/constants/linkIconColors";

const ICON_GLYPHS: Record<string, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.59 14.4a.62.62 0 01-.86.21c-2.36-1.44-5.33-1.77-8.83-.97a.62.62 0 01-.27-1.21c3.83-.88 7.12-.5 9.76 1.11a.62.62 0 01.2.86zm1.22-2.72a.78.78 0 01-1.07.26c-2.7-1.66-6.82-2.14-10.01-1.17a.78.78 0 01-.45-1.49c3.65-1.1 8.18-.57 11.27 1.33a.78.78 0 01.26 1.07zm.11-2.83C14.62 9 8.79 8.8 5.38 9.84a.93.93 0 11-.54-1.78c3.93-1.19 10.36-.96 14.21 1.36a.93.93 0 01-.93 1.61z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20" />
    </svg>
  ),
};

export function LinkIcon({ iconKey, thumbnailUrl }: { iconKey: string | null; thumbnailUrl: string | null }) {
  if (thumbnailUrl) {
    return (
      <span className="pp-link-icon">
        <Image src={thumbnailUrl} alt="" width={34} height={34} style={{ objectFit: "cover", borderRadius: 9 }} />
      </span>
    );
  }

  const cfg = LINK_ICON_COLORS[iconKey ?? ""] ?? LINK_ICON_COLORS.website;
  return (
    <span className="pp-link-icon" style={{ background: cfg.bg, color: cfg.fg }}>
      {ICON_GLYPHS[iconKey ?? ""] ?? ICON_GLYPHS.website}
    </span>
  );
}
