import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Team & roles" };

export default function AdminTeamPage() {
  return (
    <StubView
      crumb="Admin / Team"
      title="Team."
      icon="team"
      heading="Team & roles"
      description="Admin members, roles, and permissions."
    />
  );
}
