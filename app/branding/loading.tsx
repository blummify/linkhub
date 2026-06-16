export default function BrandingLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse p-6 space-y-6 max-w-3xl mx-auto pt-12">
      <div className="h-8 w-40 bg-surface-container rounded-lg" />
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 bg-surface-container-low rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-48 bg-surface-container rounded-lg" />
          <div className="h-4 w-32 bg-surface-container rounded-lg" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 bg-surface-container-low rounded-xl" />
      ))}
    </div>
  );
}
