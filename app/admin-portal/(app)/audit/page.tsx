import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Audit log" };

export default function AdminAuditPage() {
  return (
    <StubView
      crumb="Admin / Audit"
      title="Audit."
      icon="audit"
      heading="Audit log"
      description="Every admin action, who did it, and when."
    />
  );
}
