import { type LinkStatusValue } from "@/app/constants/linkStatus";

export interface ManagedLink {
  id?: string;
  title: string;
  url: string;
  /** Display string e.g. "1.2K" or "0" */
  clicks: string;
  draft?: boolean;
  /** Visual status — takes precedence over draft for UI rendering */
  status?: LinkStatusValue
  icon?: string;
  /** Optional green trend line under stats (e.g. "+12% this week") */
  trendLabel?: string;
  /** Display date string e.g. "Apr 2" */
  createdAt?: string;
  /** Data URL for uploaded thumbnail image */
  thumbnail?: string;
}
