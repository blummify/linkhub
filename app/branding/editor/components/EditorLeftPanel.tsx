"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { BackgroundSection } from "./BackgroundSection";
import { OverlaySection } from "./OverlaySection";
import { LayoutSection } from "./LayoutSection";

function Divider() {
  return <div style={{ height: 1, background: "#f0f1f7", margin: "4px 0" }} />;
}

export function EditorLeftPanel() {
  const store = useBrandingStore();
  const showOverlay = store.backgroundType === "image" || store.backgroundType === "video";

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
          backgroundType={store.backgroundType}
          backgroundValue={store.backgroundValue}
          onGradientSelect={(id) => store.setBackground("gradient", id, null)}
          onSolidSelect={(color) => store.setBackground("gradient", `solid:${color}`, null)}
          onImageUpload={(url, key) => store.setBackground("image", url, key)}
          onVideoUpload={(url, key) => store.setBackground("video", url, key)}
          onTemplateImage={(url) => store.setBackground("image", url, null)}
          onTemplateVideo={(url) => store.setBackground("video", url, null)}
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
