import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
});

export default function Home() {
  return <HomeContent />;
}
