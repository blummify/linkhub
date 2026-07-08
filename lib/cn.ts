/**
 * Tiny clsx-style class composer for conditional/variant Tailwind classes.
 *
 * Dependency-free and intentionally minimal: it joins truthy class values and
 * applies object keys whose values are truthy. Use it for variant lookups and
 * conditional classes instead of ad-hoc string concatenation.
 */

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) out.push(inner);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(" ");
}
