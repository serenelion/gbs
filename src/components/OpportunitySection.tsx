'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { FormSkeleton, FeedSkeleton } from './skeletons';

// Move dynamic imports outside the component
const OpportunityForm = dynamic(
  () => import('./opportunity/OpportunityForm'),
  {
    ssr: false,
    loading: () => <FormSkeleton />
  }
);

const OpportunityFeed = dynamic(
  () => import('./opportunity/OpportunityFeed'),
  {
    ssr: false,
    loading: () => <FeedSkeleton />
  }
);

export default function OpportunitySection() {
  return (
    <Suspense>
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
    </Suspense>
  );
} 