import { HANDLE_REGEX } from "@/app/constants/reservedHandles";

export type HandleValidation =
  | { ok: true; handle: string }
  | { ok: false; reason: string };

/** Lowercase, trim, and strip a leading @ — the canonical stored form of a handle. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

/**
 * Validate a candidate reserved handle against the same rules real handles must
 * satisfy ({@link HANDLE_REGEX}) plus a case-insensitive duplicate check.
 */
export function validateReservedHandle(raw: string, existing: string[]): HandleValidation {
  const handle = normalizeHandle(raw);
  if (!handle) return { ok: false, reason: "Enter a handle." };
  if (!HANDLE_REGEX.test(handle)) {
    return { ok: false, reason: "3–24 letters, numbers, or underscores." };
  }
  if (existing.some((h) => h.toLowerCase() === handle)) {
    return { ok: false, reason: `"${handle}" is already reserved.` };
  }
  return { ok: true, handle };
}
