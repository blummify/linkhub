/** Every value ever written for the "device" dimension category. Exhaustive —
 *  every profile view / link click writes exactly one of these, so summing
 *  just this set for a metric+date gives the true event total (see
 *  getMetricTotal/getMetricSeries in ./analytics). */
export const DEVICE_DIMENSIONS = ["mobile", "desktop", "tablet"] as const;
export type DeviceDimension = (typeof DEVICE_DIMENSIONS)[number];

/** Every value ever written for the "referrer/source" dimension category. */
export const SOURCE_DIMENSIONS = ["direct", "instagram", "twitter", "whatsapp", "linkedin", "other"] as const;
export type SourceDimension = (typeof SOURCE_DIMENSIONS)[number];

/** Every non-country dimension value — used to isolate country rows (open-ended
 *  ISO codes) via a NOT IN filter, since the country category has no fixed set. */
export const NON_COUNTRY_DIMENSIONS: readonly string[] = [...DEVICE_DIMENSIONS, ...SOURCE_DIMENSIONS];

/** Dimension value written when the visitor's country can't be resolved. */
export const UNKNOWN_COUNTRY = "unknown";
