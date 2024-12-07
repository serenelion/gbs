'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  loading: () => <Loading />,
});

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <HomeContent />
    </div>
  );
}
