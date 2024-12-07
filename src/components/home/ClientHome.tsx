'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const OpportunityForm = dynamic(() => import("../opportunity/OpportunityForm"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
});

const OpportunityFeed = dynamic(() => import("../opportunity/OpportunityFeed"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
});

export default function ClientHome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          Social Enterprise Forum
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
          {mounted && <OpportunityForm />}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Community Opportunities</h2>
        {mounted && <OpportunityFeed />}
      </div>
    </main>
  );
} 