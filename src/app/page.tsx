import { Suspense } from 'react';
import HomeLayout from '@/components/layout/HomeLayout';
import Loading from './loading';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeLayout />
    </Suspense>
  );
}
