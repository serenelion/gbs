import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from './loading';

// Dynamically import the HomeLayout component with no SSR
const HomeLayout = dynamic(() => import('@/components/layout/HomeLayout'), {
  ssr: false,
  loading: () => <Loading />
});

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeLayout />
    </Suspense>
  );
}
