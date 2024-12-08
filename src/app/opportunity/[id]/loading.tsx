export default function Loading() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded mb-8" />
        <div className="h-40 bg-gray-200 rounded-lg mb-8" />
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
} 