import dynamic from 'next/dynamic';
import Loading from './loading';

// Import HomeContent instead of ClientHome for better SSR handling
const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  loading: () => <Loading />,
  ssr: true // Enable SSR for the main content
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <HomeContent />
    </div>
  );
}
