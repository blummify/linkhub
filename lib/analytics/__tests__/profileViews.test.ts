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

beforeEach(() => {
  vi.clearAllMocks();
  asMock(isBotUserAgent).mockReturnValue(false);
  asMock(redis.set).mockResolvedValue("OK");
});

describe("recordProfileView", () => {
  it("skips bots entirely — no Redis call, no metric write", async () => {
    asMock(isBotUserAgent).mockReturnValue(true);
    await recordProfileView({ userId: "u1", userAgent: "Googlebot", ip: "1.1.1.1" });
    expect(redis.set).not.toHaveBeenCalled();
    expect(incrementMetric).not.toHaveBeenCalled();
  });

  it("records a first-time view with an NX dedup key", async () => {
    await recordProfileView({ userId: "u1", userAgent: "Mozilla/5.0", ip: "1.1.1.1" });
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining("view-seen:u1:"),
      "1",
      expect.objectContaining({ nx: true })
    );
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view");
  });

  it("does not record a repeat view within the dedup window", async () => {
    asMock(redis.set).mockResolvedValue(null);
    await recordProfileView({ userId: "u1", userAgent: "Mozilla/5.0", ip: "1.1.1.1" });
    expect(incrementMetric).not.toHaveBeenCalled();
  });

  it("fails open and still records the view if Redis errors", async () => {
    asMock(redis.set).mockRejectedValue(new Error("redis down"));
    await recordProfileView({ userId: "u1", userAgent: "Mozilla/5.0", ip: "1.1.1.1" });
    expect(incrementMetric).toHaveBeenCalledWith("u1", "profile_view");
  });
});
