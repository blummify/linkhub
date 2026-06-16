import type { ManagedLink } from "@/app/(dashboard)/user-admin/components/types";
import { LinkStatus} from "@/app/constants/linkStatus";

const DEMO_ID_PREFIX = "__demo__";

export function isDemoManagedLink(link: ManagedLink): boolean {
  return link.id?.startsWith(DEMO_ID_PREFIX) ?? false;
}

/** Static examples (not persisted); aligned with the former LinksClient mock cards. */
export const DEMO_MANAGED_LINKS: ManagedLink[] = [
  {
    id: `${DEMO_ID_PREFIX}official`,
    title: "Official Website",
    url: "https://johndoe.design",
    clicks: "1,240",
    status: LinkStatus.DRAFT,
    trendLabel: "+12% this week",
    createdAt: "Apr 2",
  },
  {
    id: `${DEMO_ID_PREFIX}portfolio`,
    title: "Latest Portfolio Drop",
    url: "https://behance.net/johndoe/vibe-check",
    clicks: "856",
    status: LinkStatus.DRAFT,
    trendLabel: "+5% this week",
    createdAt: "Apr 8",
  },
  {
    id: `${DEMO_ID_PREFIX}instagram`,
    title: "Instagram Profile",
    url: "https://instagram.com/johndoe",
    clicks: "0",
    status: LinkStatus.PUBLISHED,
    createdAt: "Apr 14",
  },
];
