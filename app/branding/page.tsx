import AppearanceClient from "./AppearanceClient";
import { BrandingAppearanceProvider } from "../components/BrandingAppearanceContext";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Branding",
  description: "Customize your public profile to reflect your brand's unique style.",
};

export default function BrandingPage() {
  return (
    <BrandingAppearanceProvider>
      <AppearanceClient />
    </BrandingAppearanceProvider>
  );
}
