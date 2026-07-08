import { z } from "zod";

const MAX_LOOKBACK_DAYS = 365;

function daysBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000;
}

export const customRangeSchema = z
  .object({
    start: z.iso.date(),
    end: z.iso.date(),
  })
  .refine((v) => v.end >= v.start, { message: "End date must not be before start date" })
  .refine((v) => daysBetween(v.start, v.end) <= MAX_LOOKBACK_DAYS, {
    message: `Range cannot exceed ${MAX_LOOKBACK_DAYS} days`,
  })
  .refine((v) => new Date(v.end).getTime() <= Date.now(), {
    message: "End date cannot be in the future",
  });

export type CustomRangeInput = z.infer<typeof customRangeSchema>;
