import { Suspense } from 'react';
import ClientHome from '@/components/home/ClientHome';
import Loading from './loading';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientHome />
    </Suspense>
  );
}
