import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ── */
vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: { profile: { findUnique: vi.fn() } },
}));

vi.mock("qrcode", () => ({
  default: { toBuffer: vi.fn() },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import QRCode from "qrcode";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const SESSION = { user: { id: "user_123" } };
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // "‰PNG" magic bytes

const mockAuth = (s: typeof SESSION | null) => asMock(auth).mockResolvedValue(s);
const mockProfile = (p: { handle: string | null; hasClaimedHandle: boolean } | null) =>
  asMock(db.profile.findUnique).mockResolvedValue(p);

beforeEach(() => {
  vi.clearAllMocks();
  asMock(QRCode.toBuffer).mockResolvedValue(PNG);
});

describe("GET /api/qr", () => {
  it("returns 401 when there is no session", async () => {
    mockAuth(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(db.profile.findUnique).not.toHaveBeenCalled();
    expect(QRCode.toBuffer).not.toHaveBeenCalled();
  });

  it("returns 404 when the user has no profile", async () => {
    mockAuth(SESSION);
    mockProfile(null);
    const res = await GET();
    expect(res.status).toBe(404);
    expect(QRCode.toBuffer).not.toHaveBeenCalled();
  });

  it("returns 404 when the handle is not yet claimed", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: false });
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns 404 when the stored handle is missing or malformed", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: null, hasClaimedHandle: true });
    expect((await GET()).status).toBe(404);

    mockProfile({ handle: 'bad"name', hasClaimedHandle: true });
    expect((await GET()).status).toBe(404);
    expect(QRCode.toBuffer).not.toHaveBeenCalled();
  });

  it("derives the handle from the session, not from request input", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: true });
    await GET();
    expect(db.profile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_123" } }),
    );
  });

  it("encodes the full https public profile URL", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: true });
    await GET();
    const encoded = asMock(QRCode.toBuffer).mock.calls[0][0] as string;
    expect(encoded).toMatch(/^https:\/\//);
    expect(encoded).toMatch(/\/joel$/);
  });

  it("generates a print-quality (>=512px) PNG", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: true });
    await GET();
    const opts = asMock(QRCode.toBuffer).mock.calls[0][1] as { type: string; width: number };
    expect(opts.type).toBe("png");
    expect(opts.width).toBeGreaterThanOrEqual(512);
  });

  it("returns a PNG with the correct download headers", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: true });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("content-disposition")).toBe(
      'attachment; filename="linkhub-joel-qr.png"',
    );
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(PNG)).toBe(true);
  });

  it("returns 500 when QR generation fails", async () => {
    mockAuth(SESSION);
    mockProfile({ handle: "joel", hasClaimedHandle: true });
    asMock(QRCode.toBuffer).mockRejectedValue(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
