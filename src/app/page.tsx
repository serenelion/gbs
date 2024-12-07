import dynamic from 'next/dynamic';
import Loading from './loading';

const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  loading: () => <Loading />,
  ssr: true
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <HomeContent />
    </div>
  );
}
