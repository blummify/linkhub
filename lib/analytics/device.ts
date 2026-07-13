import { type DeviceDimension } from "./dimensions";

/**
 * Classifies a User-Agent into "mobile" | "desktop" | "tablet". Hand-rolled
 * regex — no ua-parser-js dependency in this repo. Tablet check runs first:
 * Android tablet UAs contain "Android" without "Mobile", so checking mobile
 * first would misclassify them. A missing/empty UA defaults to "desktop" so
 * every event still lands in exactly one of the 3 buckets.
 */
export function detectDeviceType(userAgent: string | null): DeviceDimension {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(ua)) return "mobile";
  return "desktop";
}
