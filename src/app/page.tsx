import { Suspense } from 'react';
import ClientHome from '@/components/home/ClientHome';
import Loading from './loading';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<Loading />}>
        <ClientHome />
      </Suspense>
    </div>
  );
}
