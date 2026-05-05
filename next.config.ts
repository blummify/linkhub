import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any file served from /public through the image optimizer (e.g. /link_hub_logo.png).
    // Without this, Next.js 15+ can return 400 for local `src` paths.
    localPatterns: [{ pathname: "/**" }],
  },
};

export default nextConfig;
