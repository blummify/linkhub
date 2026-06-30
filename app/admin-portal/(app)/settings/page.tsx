import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <StubView
      crumb="Admin / Settings"
      title="Set"
      accent="tings."
      icon="settings"
      heading="Settings"
      description="Platform-wide configuration."
    />
  );
}
