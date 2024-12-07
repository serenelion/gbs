'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

const HomeLayout = dynamic(() => import('../layout/HomeLayout'), {
  ssr: false,
  loading: () => <Loading />
});

export default function ClientHome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading />;
  }

  return <HomeLayout />;
} 