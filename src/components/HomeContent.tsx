'use client';

import { Sparkles } from "lucide-react";
import { Suspense } from "react";
import dynamic from 'next/dynamic';

const OpportunityForm = dynamic(() => import("./opportunity/OpportunityForm"), {
  loading: () => <FormSkeleton />,
  ssr: false
});

const OpportunityFeed = dynamic(() => import("./opportunity/OpportunityFeed"), {
  loading: () => <FeedSkeleton />,
  ssr: false
});

export default function HomeContent() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          Giving Back Studio <Sparkles className="h-8 w-8 text-yellow-500" />
        </h1>
        <p className="text-gray-600">
          Connect and share opportunities with the social enterprise community
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Share an Opportunity</h2>
          <p className="text-gray-600 mb-4">
            Help grow the community by sharing opportunities for collaboration,
            funding, or support.
          </p>
          <OpportunityForm />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Community Opportunities</h2>
        <OpportunityFeed />
      </div>
    </main>
  );
}

function FormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 w-full bg-gray-200 rounded" />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
} 