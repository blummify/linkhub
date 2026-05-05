import AppearanceClient from "./AppearanceClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearance - Creator Hub",
  description: "Customize your public profile to reflect your brand's unique style.",
};

export default function AppearancePage() {
  return <AppearanceClient />;
}
