import { Metadata } from 'next';
import OpportunityPage from '@/components/opportunity/OpportunityPage';
import { Suspense } from 'react';
import Loading from './loading';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Opportunity Details | Giving Back Studio',
  description: 'View and respond to opportunities in the social enterprise community',
};

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <OpportunityPage params={params} />
    </Suspense>
  );
} 