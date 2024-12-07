export function FormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 w-full bg-gray-200 rounded" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
} 