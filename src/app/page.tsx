import dynamic from 'next/dynamic';
import Loading from './loading';

const ClientHome = dynamic(() => import('@/components/home/ClientHome'), {
  ssr: false,
  loading: () => <Loading />
});

export default function Home() {
  return <ClientHome />;
}
