export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="flex h-screen">
        {/* sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-64 bg-surface-container-low border-r border-outline-variant/30 p-4 gap-3">
          <div className="h-10 w-36 bg-surface-container rounded-lg mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-full bg-surface-container rounded-lg" />
          ))}
        </div>
        {/* main content skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-surface-container-low border-b border-outline-variant/30 px-6 flex items-center gap-4">
            <div className="h-8 w-48 bg-surface-container rounded-lg" />
            <div className="ml-auto h-8 w-8 bg-surface-container rounded-full" />
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="h-8 w-64 bg-surface-container rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface-container-low rounded-2xl" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-container-low rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
