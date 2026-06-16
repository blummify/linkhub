import CollapsibleSidebar from "@/app/components/CollapsibleSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f7f8fc] dark:bg-surface min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>{children}</CollapsibleSidebar>
    </div>
  );
}
