"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/app/components/hooks/usePrefersReducedMotion";
import type { ManagedLink } from "../components/types";

export type LinkMotionItem = {
  link: ManagedLink;
  exiting: boolean;
  entering: boolean;
};

function getLinkId(link: ManagedLink): string {
  return link.id ?? link.url;
}

export function useLinkListMotion(links: ManagedLink[]): LinkMotionItem[] {
  const reduced = usePrefersReducedMotion();
  const linksRef = useRef(links);
  linksRef.current = links;

  const [items, setItems] = useState<LinkMotionItem[]>(() =>
    links.map((link) => ({ link, exiting: false, entering: false })),
  );
  const prevIdsRef = useRef(links.map(getLinkId));
  const linkIdsKey = useMemo(() => links.map(getLinkId).join("\0"), [links]);

  useEffect(() => {
    const currentLinks = linksRef.current;
    const prevIds = prevIdsRef.current;
    const nextIds = linkIdsKey.length > 0 ? linkIdsKey.split("\0") : [];
    const prevSet = new Set(prevIds);
    const nextSet = new Set(nextIds);

    const removedIds = prevIds.filter((id) => !nextSet.has(id));
    const addedIds = nextIds.filter((id) => !prevSet.has(id));

    prevIdsRef.current = nextIds;

    if (removedIds.length === 0 && addedIds.length === 0) {
      setItems(currentLinks.map((link) => ({ link, exiting: false, entering: false })));
      return;
    }

    setItems((prev) => {
      if (removedIds.length > 0) {
        const result: LinkMotionItem[] = [];

        for (const item of prev) {
          const id = getLinkId(item.link);
          if (removedIds.includes(id)) {
            result.push({ ...item, exiting: true, entering: false });
            continue;
          }
          const updated = currentLinks.find((l) => getLinkId(l) === id);
          if (updated) {
            result.push({ link: updated, exiting: false, entering: false });
          }
        }

        for (const link of currentLinks) {
          if (!result.some((i) => getLinkId(i.link) === getLinkId(link))) {
            result.push({
              link,
              exiting: false,
              entering: addedIds.includes(getLinkId(link)) && !reduced,
            });
          }
        }

        return result;
      }

      return currentLinks.map((link) => ({
        link,
        exiting: false,
        entering: addedIds.includes(getLinkId(link)) && !reduced,
      }));
    });

    if (removedIds.length === 0) return;

    if (reduced) {
      setItems((curr) => curr.filter((i) => !i.exiting));
      return;
    }

    const timeout = window.setTimeout(() => {
      setItems((curr) => curr.filter((i) => !i.exiting));
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [linkIdsKey, reduced]);

  return items.map((item) => {
    if (item.exiting) return item;
    const fresh = links.find((l) => getLinkId(l) === getLinkId(item.link));
    return fresh ? { ...item, link: fresh } : item;
  });
}
