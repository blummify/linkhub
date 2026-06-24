import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEditorMobilePreview } from "../useEditorMobilePreview";

describe("useEditorMobilePreview", () => {
  it("returns appearance and publicUrl from branding store", () => {
    const { result } = renderHook(() => useEditorMobilePreview());
    expect(result.current.appearance.profileTitle).toBe("Your Name");
    expect(result.current.publicUrl).toContain("getlinkhub.app");
    expect(result.current.showHeaderChrome).toBe(false);
  });

  it("merges overrides", () => {
    const { result } = renderHook(
      () => useEditorMobilePreview({ linkDensity: "relaxed" })
    );
    expect(result.current.linkDensity).toBe("relaxed");
  });
});
