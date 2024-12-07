'use client';

import { Suspense } from 'react';
import HomeLayout from '@/components/layout/HomeLayout';
import Loading from '@/app/loading';

export default function ClientHome() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeLayout />
    </Suspense>
  );
} 