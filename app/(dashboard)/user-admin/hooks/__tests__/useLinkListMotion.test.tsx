import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLinkListMotion } from "../useLinkListMotion";
import type { ManagedLink } from "../../components/types";

const link = (id: string): ManagedLink => ({
  id,
  title: `Link ${id}`,
  url: `https://example.com/${id}`,
  clicks: "0",
});

describe("useLinkListMotion", () => {
  it("maps links to motion items", () => {
    const { result } = renderHook(() => useLinkListMotion([link("1"), link("2")]));
    expect(result.current).toHaveLength(2);
    expect(result.current.every((i) => !i.exiting && !i.entering)).toBe(true);
  });
});
