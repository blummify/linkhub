/** Corner shape for link buttons in branding / live preview */
export type BrandingButtonShape = "square" | "rounded" | "pill";

export const BRANDING_BUTTON_SHAPES: {
  id: BrandingButtonShape;
  label: string;
  /** Border radius (px) applied to preview link cards */
  radiusPx: number;
}[] = [
  { id: "square", label: "Square", radiusPx: 0 },
  { id: "rounded", label: "Rounded", radiusPx: 12 },
  { id: "pill", label: "Pill", radiusPx: 999 },
];

const DEFAULT_SHAPE: BrandingButtonShape = "rounded";

export function normalizeBrandingButtonShape(value: string): BrandingButtonShape {
  if (value === "square" || value === "rounded" || value === "pill") return value;
  return DEFAULT_SHAPE;
}

export function previewLinkBorderRadiusPx(shape: string): number {
  const id = normalizeBrandingButtonShape(shape);
  return BRANDING_BUTTON_SHAPES.find((s) => s.id === id)?.radiusPx ?? 12;
}

/** Tailwind radius classes for `MobilePreview` link cards */
export function previewLinkBorderRadiusClass(shape: string): string {
  const id = normalizeBrandingButtonShape(shape);
  if (id === "square") return "rounded-none";
  if (id === "pill") return "rounded-full";
  return "rounded-xl";
}
