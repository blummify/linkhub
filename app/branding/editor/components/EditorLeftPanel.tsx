"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";
import { BackgroundSection } from "./BackgroundSection";
import { OverlaySection } from "./OverlaySection";
import { LayoutSection } from "./LayoutSection";

function Divider() {
  return <div style={{ height: 1, background: "#f0f1f7", margin: "4px 0" }} />;
}

export function EditorLeftPanel() {
  const { backgroundType, backgroundValue, setBackground } = useBrandingStore(
    useShallow((s) => ({
      backgroundType: s.backgroundType,
      backgroundValue: s.backgroundValue,
      setBackground: s.setBackground,
    }))
  );
  const showOverlay = backgroundType === "image" || backgroundType === "video";

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        overflowY: "auto",
        borderRight: "1px solid #eef0f7",
        background: "white",
        scrollbarWidth: "none",
      }}
    >
      {/* Background */}
      <section style={{ padding: "20px 20px 24px" }}>
        <BackgroundSection
          backgroundType={backgroundType}
          backgroundValue={backgroundValue}
          onTabSwitch={(type) => {
            if (type === "gradient") setBackground("gradient", "midnight", null);
            else if (type === "image") setBackground("image", "", null);
            else if (type === "video") setBackground("video", "", null);
          }}
          onGradientSelect={(id) => setBackground("gradient", id, null)}
          onSolidSelect={(color) => setBackground("gradient", `solid:${color}`, null)}
          onImageUpload={(url, key) => setBackground("image", url, key)}
          onVideoUpload={(url, key) => setBackground("video", url, key)}
          onTemplateImage={(url) => setBackground("image", url, null)}
          onTemplateVideo={(url) => setBackground("video", url, null)}
        />
      </section>

      {/* Overlay — only when image or video */}
      {showOverlay && (
        <>
          <Divider />
          <section style={{ padding: "20px 20px 24px" }}>
            <OverlaySection />
          </section>
        </>
      )}

      <Divider />

      {/* Layout */}
      <section style={{ padding: "20px 20px 24px" }}>
        <LayoutSection />
      </section>
    </div>
  );
}
