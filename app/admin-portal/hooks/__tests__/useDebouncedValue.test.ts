import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the latest value only after the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: "a" },
    });

    expect(result.current).toBe("a");

    rerender({ value: "ab" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ab");
  });

  it("resets the timer on rapid changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(150));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe("abc");
  });
});
