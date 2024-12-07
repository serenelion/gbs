'use client';

import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const HomeLayout = dynamic(() => import('../layout/HomeLayout'), {
  ssr: false,
  loading: () => <Loading />
});

export default function ClientHome() {
  return <HomeLayout />;
} 