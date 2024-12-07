import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { FormSkeleton, FeedSkeleton } from '@/components/skeletons';

const OpportunityForm = dynamic(() => import("@/components/opportunity/OpportunityForm"), {
  ssr: false,
  loading: () => <FormSkeleton />
});

const OpportunityFeed = dynamic(() => import("@/components/opportunity/OpportunityFeed"), {
  ssr: false,
  loading: () => <FeedSkeleton />
});

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Giving Back Studio</h1>
        <p className="text-gray-600">Connect and share opportunities with the community</p>
      </div>
      <Suspense fallback={<FormSkeleton />}>
        <OpportunityForm />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <OpportunityFeed />
      </Suspense>
    </main>
  );
}

// Add static page config
export const dynamic = 'force-static'; 