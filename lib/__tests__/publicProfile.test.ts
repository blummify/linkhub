import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { profile: { findUnique: vi.fn() } },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { getPublicProfileByHandle, invalidatePublicProfileCache } from "../publicProfile";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const PROFILE_ROW = {
  displayName: "Joel Osei Acquah",
  bio: "Connecting with your community",
  avatarUrl: "https://assets.getlinkhub.app/avatar.png",
  themeId: "midnight",
  accentColor: "#3b46e0",
  buttonStyle: "rounded",
  fontFamily: "Instrument Serif",
  backgroundType: "gradient",
  backgroundValue: "midnight",
  cardStyle: "filled",
  hasClaimedHandle: true,
  user: {
    id: "u1",
    name: "Joel Osei",
    links: [{ id: "l1", title: "Website", url: "https://joel.dev", icon: "website", thumbnailUrl: null }],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  asMock(redis.get).mockResolvedValue(null);
  asMock(redis.set).mockResolvedValue("OK");
});

describe("getPublicProfileByHandle", () => {
  it("returns null without hitting the DB for an invalid handle format", async () => {
    const result = await getPublicProfileByHandle("a");
    expect(result).toBeNull();
    expect(db.profile.findUnique).not.toHaveBeenCalled();
  });

  it("returns null without hitting the DB for a reserved handle", async () => {
    const result = await getPublicProfileByHandle("billing");
    expect(result).toBeNull();
    expect(db.profile.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when no profile is found", async () => {
    asMock(db.profile.findUnique).mockResolvedValue(null);
    const result = await getPublicProfileByHandle("joelosei");
    expect(result).toBeNull();
  });

  it("returns null when the handle was never claimed", async () => {
    asMock(db.profile.findUnique).mockResolvedValue({ ...PROFILE_ROW, hasClaimedHandle: false });
    const result = await getPublicProfileByHandle("joelosei");
    expect(result).toBeNull();
  });

  it("maps a claimed profile to the public shape, including only its links", async () => {
    asMock(db.profile.findUnique).mockResolvedValue(PROFILE_ROW);
    const result = await getPublicProfileByHandle("joelosei");
    expect(result?.displayName).toBe("Joel Osei Acquah");
    expect(result?.userName).toBe("Joel Osei");
    expect(result?.userId).toBe("u1");
    expect(result?.links).toEqual(PROFILE_ROW.user.links);
  });

  it("returns a cached profile without hitting the DB", async () => {
    asMock(redis.get).mockResolvedValue({ ...PROFILE_ROW, links: PROFILE_ROW.user.links, userName: "Joel Osei" });
    const result = await getPublicProfileByHandle("joelosei");
    expect(result?.userName).toBe("Joel Osei");
    expect(db.profile.findUnique).not.toHaveBeenCalled();
  });
});

describe("invalidatePublicProfileCache", () => {
  it("deletes the cache key for the given handle", async () => {
    await invalidatePublicProfileCache("JoelOsei");
    expect(redis.del).toHaveBeenCalledWith("public-profile:joelosei");
  });

  it("does nothing when handle is null/undefined", async () => {
    await invalidatePublicProfileCache(null);
    await invalidatePublicProfileCache(undefined);
    expect(redis.del).not.toHaveBeenCalled();
  });
});
