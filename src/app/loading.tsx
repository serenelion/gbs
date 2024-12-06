'use client';

export default function Loading() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
} 