import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useShortKey } from "../useShortKey";

describe("useShortKey", () => {
  it("returns a modifier label string", () => {
    const { result } = renderHook(() => useShortKey(vi.fn()));
    expect(typeof result.current.modifier).toBe("string");
    expect(result.current.modifier.length).toBeGreaterThan(0);
  });

  it("calls onTrigger when Ctrl+K is pressed (default key)", () => {
    const onTrigger = vi.fn();
    renderHook(() => useShortKey(onTrigger));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("calls onTrigger for a custom key (e.g. s)", () => {
    const onTrigger = vi.fn();
    renderHook(() => useShortKey(onTrigger, { key: "s" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true }));
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("does not call onTrigger when the modifier is not held", () => {
    const onTrigger = vi.fn();
    renderHook(() => useShortKey(onTrigger));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("does not call onTrigger when a different key is pressed", () => {
    const onTrigger = vi.fn();
    renderHook(() => useShortKey(onTrigger));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", ctrlKey: true }));
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("does not call onTrigger when enabled is false", () => {
    const onTrigger = vi.fn();
    renderHook(() => useShortKey(onTrigger, { enabled: false }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("removes the event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useShortKey(vi.fn()));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    removeSpy.mockRestore();
  });
});
