"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { FontPicker } from "./FontPicker";

export function TypographySection() {
  const store = useBrandingStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FontPicker
        label="Heading font"
        value={store.fontFamily}
        onChange={store.setFontFamily}
      />
      <FontPicker
        label="Body font"
        value={store.bodyFont}
        onChange={store.setBodyFont}
      />
    </div>
  );
}
