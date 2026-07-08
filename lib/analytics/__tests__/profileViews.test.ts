import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
  redis: { set: vi.fn() },
}));

vi.mock("../analytics", () => ({
  incrementMetric: vi.fn(),
}));

vi.mock("../botUserAgents", () => ({
  isBotUserAgent: vi.fn(),
}));

import { redis } from "@/lib/redis";
import { incrementMetric } from "../analytics";
import { isBotUserAgent } from "../botUserAgents";
import { recordProfileView } from "../profileViews";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const baseInput = {
  userId: "u1",
  userAgent: "Mozilla/5.0",
  ip: "1.1.1.1",
  referrer: null,
  country: "GH",
};

beforeEach(() => {
  vi.clearAllMocks();
  asMock(isBotUserAgent).mockReturnValue(false);
  asMock(redis.set).mockResolvedValue("OK");
});

describe("recordProfileView", () => {
  it("skips bots entirely — no Redis call, no metric write", async () => {
    asMock(isBotUserAgent).mockReturnValue(true);
    await recordProfileView({ ...baseInput, userAgent: "Googlebot" });
    expect(redis.set).not.toHaveBeenCalled();
    expect(incrementMetric).not.toHaveBeenCalled();
  });

  it("records a first-time view with an NX dedup key and one row per dimension", async () => {
    await recordProfileView(baseInput);
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining("view-seen:u1:"),
      "1",
      expect.objectContaining({ nx: true })
    );
    expect(incrementMetric).toHaveBeenCalledTimes(3);
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view", "desktop");
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view", "direct");
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view", "GH");
  });

  it("falls back to the unknown country dimension when country can't be resolved", async () => {
    await recordProfileView({ ...baseInput, country: null });
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view", "unknown");
  });

  it("does not record a repeat view within the dedup window", async () => {
    asMock(redis.set).mockResolvedValue(null);
    await recordProfileView(baseInput);
    expect(incrementMetric).not.toHaveBeenCalled();
  });

  it("fails open and still records the view if Redis errors", async () => {
    asMock(redis.set).mockRejectedValue(new Error("redis down"));
    await recordProfileView(baseInput);
    expect(incrementMetric).toHaveBeenCalledTimes(3);
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view", "desktop");
  });
});
