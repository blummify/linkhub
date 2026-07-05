import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Pages" };

export default function AdminPagesPage() {
  return (
    <StubView
      crumb="Admin / Pages"
      title="Pages."
      icon="pages"
      heading="Pages"
      description="Browse and inspect every public profile page."
    />
  );
}
