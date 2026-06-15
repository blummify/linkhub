"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";
import { FontPicker } from "./FontPicker";

export function TypographySection() {
  const { fontFamily, setFontFamily, bodyFont, setBodyFont } = useBrandingStore(
    useShallow((s) => ({
      fontFamily: s.fontFamily,
      setFontFamily: s.setFontFamily,
      bodyFont: s.bodyFont,
      setBodyFont: s.setBodyFont,
    }))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FontPicker
        label="Heading font"
        value={fontFamily}
        onChange={setFontFamily}
      />
      <FontPicker
        label="Body font"
        value={bodyFont}
        onChange={setBodyFont}
      />
    </div>
  );
}
