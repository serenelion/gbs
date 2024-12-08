import { Metadata } from 'next';
import OpportunityPage from '@/components/opportunity/OpportunityPage';
import { Suspense } from 'react';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Opportunity Details | Giving Back Studio',
  description: 'View and respond to opportunities in the social enterprise community',
};

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<Loading />}>
        <OpportunityPage params={params} />
      </Suspense>
    </div>
  );
} 