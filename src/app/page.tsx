import { Suspense } from 'react';
import Loading from './loading';
import dynamic from 'next/dynamic';

// Import the client component
const ClientHome = dynamic(() => import('@/components/home/ClientHome'), {
  ssr: false,
  loading: () => <Loading />
});

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientHome />
    </Suspense>
  );
}
