import { Suspense } from 'react';
import Loading from './loading';
import HomeLayout from '@/components/layout/HomeLayout';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeLayout />
    </Suspense>
  );
}
