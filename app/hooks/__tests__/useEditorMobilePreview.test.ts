import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEditorMobilePreview } from "../useEditorMobilePreview";
import { BrandingAppearanceProvider } from "@/app/components/BrandingAppearanceContext";
import { createElement } from "react";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(BrandingAppearanceProvider, null, children);
}

describe("useEditorMobilePreview", () => {
  it("returns appearance and publicUrl from branding context", () => {
    const { result } = renderHook(() => useEditorMobilePreview(), { wrapper });
    expect(result.current.appearance.profileTitle).toBe("Your Name");
    expect(result.current.publicUrl).toContain("linkhub.co");
    expect(result.current.showHeaderChrome).toBe(false);
  });

  it("merges overrides", () => {
    const { result } = renderHook(
      () => useEditorMobilePreview({ linkDensity: "relaxed" }),
      { wrapper }
    );
    expect(result.current.linkDensity).toBe("relaxed");
  });
});
