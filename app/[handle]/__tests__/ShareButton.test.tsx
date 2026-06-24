import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareButton } from "../ShareButton";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ShareButton", () => {
  it("calls navigator.share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });

    render(<ShareButton title="Joel | Linkhub" />);
    fireEvent.click(screen.getByRole("button", { name: /share this page/i }));

    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: "Joel | Linkhub", url: window.location.href }));

    Reflect.deleteProperty(navigator, "share");
  });

  it("falls back to clipboard when navigator.share is unavailable", async () => {
    Reflect.deleteProperty(navigator, "share");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<ShareButton title="Joel | Linkhub" />);
    fireEvent.click(screen.getByRole("button", { name: /share this page/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
  });
});
