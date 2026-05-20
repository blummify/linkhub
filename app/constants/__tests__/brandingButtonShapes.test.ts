import { describe, expect, it } from "vitest";
import {
  normalizeBrandingButtonShape,
  previewLinkBorderRadiusClass,
  previewLinkBorderRadiusPx,
} from "../brandingButtonShapes";

describe("brandingButtonShapes", () => {
  it("normalizes unknown values to rounded", () => {
    expect(normalizeBrandingButtonShape("unknown")).toBe("rounded");
  });

  it("maps shapes to preview border radius", () => {
    expect(previewLinkBorderRadiusPx("square")).toBe(0);
    expect(previewLinkBorderRadiusPx("rounded")).toBe(12);
    expect(previewLinkBorderRadiusPx("pill")).toBe(999);
  });

  it("maps shapes to tailwind classes", () => {
    expect(previewLinkBorderRadiusClass("square")).toBe("rounded-none");
    expect(previewLinkBorderRadiusClass("rounded")).toBe("rounded-xl");
    expect(previewLinkBorderRadiusClass("pill")).toBe("rounded-full");
  });
});
