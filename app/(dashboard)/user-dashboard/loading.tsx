export default function UserDashboardLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse p-6 space-y-4 max-w-3xl mx-auto pt-12">
      <div className="h-8 w-40 bg-surface-container rounded-lg" />
      <div className="h-12 w-full bg-surface-container rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-surface-container-low rounded-xl" />
      ))}
    </div>
  );
}
