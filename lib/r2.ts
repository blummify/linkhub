// Server-only — never import this file from client components.
// All functions require CLOUDFLARE_R2_* environment variables to be set.

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ── Singleton client (lazy, dev-mode safe) ────────────────────────────────────

const globalForR2 = globalThis as unknown as { _r2?: S3Client };

function makeR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "[R2] Missing environment variables. Ensure CLOUDFLARE_R2_ACCOUNT_ID, " +
        "CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY are set."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export const r2: S3Client = new Proxy({} as S3Client, {
  get(_, prop) {
    const client = (globalForR2._r2 ??= makeR2Client());
    return Reflect.get(client, prop, client);
  },
});

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Returns a presigned PUT URL valid for `expiresIn` seconds (default 120).
 * The client uploads the file directly to R2 — the Next.js server never
 * handles the file bytes.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 120
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Deletes an object from R2. NoSuchKey errors are silently ignored (idempotent).
 * Other errors are logged and re-thrown.
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
      })
    );
  } catch (err: unknown) {
    const code = (err as { Code?: string; code?: string }).Code ?? (err as { Code?: string; code?: string }).code;
    if (code === "NoSuchKey") return;
    console.error("[R2] deleteFromR2 failed for key:", key, err);
    throw err;
  }
}

/**
 * Returns the public CDN URL for a given R2 object key.
 * Defensively strips any trailing slash from CLOUDFLARE_R2_PUBLIC_URL.
 */
export function getR2PublicUrl(key: string): string {
  const base = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  return `${base}/${key}`;
}

/**
 * Extracts the R2 object key from a public URL.
 * Returns null if the URL does not originate from the configured R2 public base.
 */
export function parseR2Key(publicUrl: string): string | null {
  const base = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!base || !publicUrl.startsWith(`${base}/`)) return null;
  return publicUrl.slice(base.length + 1);
}
