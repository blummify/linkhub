import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { brandingPublicUrl } from "@/lib/brandingState";

export const runtime = "nodejs";

/**
 * Defensive guard mirroring the authoritative claim-time check
 * (see `claimHandle` in app/actions/links.ts). Handles are already validated
 * on claim, but we re-verify here so a malformed value can never be
 * interpolated into the `Content-Disposition` header (header-injection safety).
 */
const HANDLE_RE = /^[a-zA-Z0-9_]{3,24}$/;

const QR_OPTIONS = {
  type: "png",
  width: 1024, // well above the 512px print minimum, for crisp scaling
  margin: 2, // quiet zone so scanners lock on reliably
  errorCorrectionLevel: "M",
} as const;

/**
 * Returns a PNG QR code for the authenticated user's public profile URL.
 *
 * The handle is read from the signed-in user's own profile — never from the
 * request — so a user can only ever download their own QR code, and there is
 * no untrusted input to validate or sanitize on the way in.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { handle: true, hasClaimedHandle: true },
  });

  const handle = profile?.handle?.trim() ?? "";
  if (!profile?.hasClaimedHandle || !HANDLE_RE.test(handle)) {
    return NextResponse.json({ error: "No claimed handle" }, { status: 404 });
  }

  const url = `https://${brandingPublicUrl(handle)}`;

  let png: Buffer;
  try {
    png = await QRCode.toBuffer(url, QR_OPTIONS);
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="linkhub-${handle}-qr.png"`,
      // Per-user, low-frequency download: regenerate each time so a handle
      // change is reflected immediately. Generation costs only a few ms.
      "Cache-Control": "private, no-store",
    },
  });
}
