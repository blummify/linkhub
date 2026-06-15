export default function UserAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse p-6 space-y-6 max-w-5xl mx-auto pt-12">
      <div className="h-8 w-40 bg-surface-container rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-surface-container-low rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-surface-container-low rounded-2xl" />
    </div>
  );
}
