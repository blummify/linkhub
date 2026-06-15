export default function MyAccountLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse p-6 space-y-5 max-w-2xl mx-auto pt-12">
      <div className="h-8 w-36 bg-surface-container rounded-lg" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-surface-container rounded" />
          <div className="h-11 w-full bg-surface-container-low rounded-lg" />
        </div>
      ))}
    </div>
  );
}
