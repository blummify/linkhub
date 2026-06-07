"use server";

import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { getPresignedUploadUrl, getR2PublicUrl, deleteFromR2 } from "@/lib/r2";

export type UploadFolder = "avatars" | "link-thumbnails" | "backgrounds";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "video/mp4":  "mp4",
  "video/webm": "webm",
  "video/ogg":  "ogv",
};

const FOLDER_SIZE_LIMITS: Record<UploadFolder, number> = {
  "avatars":         5  * 1024 * 1024,  //  5 MB
  "link-thumbnails": 2  * 1024 * 1024,  //  2 MB
  "backgrounds":     50 * 1024 * 1024,  // 50 MB (covers HD images + short videos)
};

/**
 * Validates the file and returns a presigned PUT URL the client can use to
 * upload directly to R2. The Next.js server never handles the file bytes.
 */
export async function getPresignedUploadUrlAction(params: {
  folder: UploadFolder;
  fileName: string;
  contentType: string;
  fileSize: number;
}): Promise<{ url: string; key: string; publicUrl: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!ALLOWED_TYPES.has(params.contentType)) {
    return { error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." };
  }

  const limit = FOLDER_SIZE_LIMITS[params.folder];
  if (params.fileSize > limit) {
    const mb = Math.round(limit / 1024 / 1024);
    return { error: `File too large. Maximum size is ${mb} MB.` };
  }

  try {
    const ext = EXT_MAP[params.contentType] ?? "jpg";
    const key = `${params.folder}/${session.user.id}/${randomUUID()}.${ext}`;
    const url = await getPresignedUploadUrl(key, params.contentType);
    return { url, key, publicUrl: getR2PublicUrl(key) };
  } catch {
    return { error: "Could not generate upload URL. Please try again." };
  }
}

/**
 * Compensating action: deletes an R2 object that was uploaded but whose DB
 * write subsequently failed. Validates the key belongs to the requesting user
 * so a client cannot delete arbitrary objects.
 */
export async function deleteOrphanedUpload(key: string): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Key must be scoped to this user: {folder}/{userId}/...
  const expectedPrefix = `avatars/${session.user.id}/`;
  const thumbPrefix    = `link-thumbnails/${session.user.id}/`;
  const bgPrefix       = `backgrounds/${session.user.id}/`;
  if (!key.startsWith(expectedPrefix) && !key.startsWith(thumbPrefix) && !key.startsWith(bgPrefix)) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteFromR2(key);
    return { success: true };
  } catch {
    return { error: "Failed to clean up uploaded file." };
  }
}
