'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';
import { FormSkeleton, FeedSkeleton } from '../skeletons';

const OpportunityForm = dynamic(() => import("../opportunity/OpportunityForm"), {
  ssr: false,
  loading: () => <FormSkeleton />
});

const OpportunityFeed = dynamic(() => import("../opportunity/OpportunityFeed"), {
  ssr: false,
  loading: () => <FeedSkeleton />
});

export default function HomeLayout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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