import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_DOMAIN } from "@/lib/appConfig";
import { getPublicProfileByHandle } from "@/lib/publicProfile";
import { computeProfileThemeTokens } from "@/lib/publicProfileTheme";
import { ShareButton } from "./ShareButton";
import { LinkIcon } from "./LinkIcon";
import "./public-profile.css";

const RESERVED_HANDLES = new Set([
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "manifest.json",
  "manifest.webmanifest",
  "apple-touch-icon.png",
  "og-image.png",
]);

interface PageParams {
  params: Promise<{ handle: string }>;
}

function profileUrl(handle: string): string {
  return `https://${APP_DOMAIN}/${handle}`;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { handle } = await params;

  if (RESERVED_HANDLES.has(handle)) return {};

  const profile = await getPublicProfileByHandle(handle);
  if (!profile) return { title: { absolute: "Page not found" } };

  const displayName = profile.displayName ?? profile.userName ?? handle;
  const description = profile.bio ?? `${displayName}'s links on Linkhub`;
  const url = profileUrl(handle);
  const title = `${displayName} | Linkhub`;

  return {
    // `absolute` opts out of the root layout's `"%s | LinkHub"` title template —
    // the ticket requires the title to be exactly "{displayName} | Linkhub".
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
  };
}

export default async function PublicProfilePage({ params }: PageParams) {
  const { handle } = await params;

  if (RESERVED_HANDLES.has(handle)) notFound();

  const profile = await getPublicProfileByHandle(handle);
  if (!profile) notFound();

  const displayName = profile.displayName ?? profile.userName ?? handle;
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const tokens = computeProfileThemeTokens(profile);

  return (
    <div className="pp-root" style={tokens as CSSProperties}>
      <main className="pp-page">
        <div className="pp-topbar">
          <ShareButton title={`${displayName} | Linkhub`} />
        </div>

        {profile.avatarUrl ? (
          <div className="pp-avatar">
            <Image src={profile.avatarUrl} alt={displayName} width={88} height={88} />
          </div>
        ) : (
          <div className="pp-avatar" aria-hidden="true">{initial}</div>
        )}

        <h1 className="pp-name">{displayName}</h1>
        <p className="pp-handle">@{handle}</p>
        {profile.bio && <p className="pp-bio">{profile.bio}</p>}

        <nav className="pp-socials" aria-label="Social profiles">
          <a className="pp-social" href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" /></svg>
          </a>
          <a className="pp-social" href="#" aria-label="X">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a className="pp-social" href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
          <a className="pp-social" href="#" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg>
          </a>
        </nav>

        {profile.links.length === 0 ? (
          <p className="pp-empty">No links published yet — check back soon.</p>
        ) : (
          <div className="pp-links">
            {profile.links.map((link) => (
              <a key={link.id} className="pp-link" href={`/api/r/${link.id}`} target="_blank" rel="noopener">
                <LinkIcon iconKey={link.icon} thumbnailUrl={link.thumbnailUrl} />
                <span className="pp-link-label">{link.title}</span>
                <span className="pp-link-chev" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                </span>
              </a>
            ))}
          </div>
        )}

        <footer className="pp-footer">
          made with <Link href="/"><b>linkhub</b></Link> ✦
        </footer>
      </main>
    </div>
  );
}
