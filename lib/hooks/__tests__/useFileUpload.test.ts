import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "../useFileUpload";

// Mock the server action
vi.mock("@/app/actions/upload", () => ({
  getPresignedUploadUrlAction: vi.fn(),
}));

import { getPresignedUploadUrlAction } from "@/app/actions/upload";

const mockPresign = vi.mocked(getPresignedUploadUrlAction);

// ── XHR mock ──────────────────────────────────────────────────────────────────

class MockXHR {
  static instances: MockXHR[] = [];

  upload = { onprogress: null as ((e: ProgressEvent) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 200;
  aborted = false;

  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => {
    this.aborted = true;
    this.onabort?.();
  });

  constructor() {
    MockXHR.instances.push(this);
  }

  simulateLoad(status = 200) {
    this.status = status;
    this.onload?.();
  }

  simulateError() {
    this.onerror?.();
  }
}

const makeFile = (name = "photo.png", type = "image/png", size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

describe("useFileUpload", () => {
  beforeEach(() => {
    MockXHR.instances = [];
    vi.stubGlobal("XMLHttpRequest", MockXHR);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns idle initial state", () => {
    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars" })
    );
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("rejects oversized file before hitting the server", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars", maxSizeMB: 1, onError })
    );

    // 2 MB file against 1 MB limit
    const file = makeFile("big.png", "image/png", 2 * 1024 * 1024);
    let returned: string | null = "sentinel";

    await act(async () => {
      returned = await result.current.upload(file);
    });

    expect(returned).toBeNull();
    expect(result.current.error).toMatch(/too large/i);
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/too large/i));
    expect(mockPresign).not.toHaveBeenCalled();
  });

  it("propagates server validation error", async () => {
    mockPresign.mockResolvedValueOnce({ error: "File type not allowed." });
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars", onError })
    );

    let returned: string | null = "sentinel";
    await act(async () => {
      returned = await result.current.upload(makeFile());
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe("File type not allowed.");
    expect(onError).toHaveBeenCalledWith("File type not allowed.");
  });

  it("uploads successfully and calls onSuccess", async () => {
    mockPresign.mockResolvedValueOnce({
      url: "https://r2.example.com/put-url",
      key: "avatars/user1/uuid.png",
      publicUrl: "https://pub.r2.dev/avatars/user1/uuid.png",
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars", onSuccess })
    );

    let returned: string | null = null;
    await act(async () => {
      const uploadPromise = result.current.upload(makeFile());
      // Flush the presign promise microtask so XHR is created before we simulate
      await Promise.resolve();
      const xhr = MockXHR.instances[0];
      xhr.simulateLoad(200);
      returned = await uploadPromise;
    });

    expect(returned).toBe("https://pub.r2.dev/avatars/user1/uuid.png");
    expect(onSuccess).toHaveBeenCalledWith(
      "https://pub.r2.dev/avatars/user1/uuid.png",
      "avatars/user1/uuid.png"
    );
    expect(result.current.progress).toBe(100);
    expect(result.current.isUploading).toBe(false);
  });

  it("returns null and sets error on XHR network failure", async () => {
    mockPresign.mockResolvedValueOnce({
      url: "https://r2.example.com/put-url",
      key: "avatars/user1/uuid.png",
      publicUrl: "https://pub.r2.dev/avatars/user1/uuid.png",
    });

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars", onError })
    );

    let returned: string | null = "sentinel";
    await act(async () => {
      const uploadPromise = result.current.upload(makeFile());
      await Promise.resolve();
      MockXHR.instances[0].simulateError();
      returned = await uploadPromise;
    });

    expect(returned).toBeNull();
    expect(result.current.error).toMatch(/failed/i);
    expect(onError).toHaveBeenCalled();
  });

  it("returns null and sets error on 403 (expired presign)", async () => {
    mockPresign.mockResolvedValueOnce({
      url: "https://r2.example.com/put-url",
      key: "avatars/user1/uuid.png",
      publicUrl: "https://pub.r2.dev/avatars/user1/uuid.png",
    });

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars", onError })
    );

    let returned: string | null = "sentinel";
    await act(async () => {
      const uploadPromise = result.current.upload(makeFile());
      await Promise.resolve();
      MockXHR.instances[0].simulateLoad(403);
      returned = await uploadPromise;
    });

    expect(returned).toBeNull();
    expect(result.current.error).toMatch(/expired/i);
  });

  it("reset() clears error and progress", async () => {
    mockPresign.mockResolvedValueOnce({ error: "File type not allowed." });

    const { result } = renderHook(() =>
      useFileUpload({ folder: "avatars" })
    );

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });
});
