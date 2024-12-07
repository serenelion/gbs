import OpportunityForm from "@/components/opportunity/OpportunityForm";
import OpportunityFeed from "@/components/opportunity/OpportunityFeed";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Giving Back Studio</h1>
        <p className="text-gray-600">Connect and share opportunities with the community</p>
      </div>
      <OpportunityForm />
      <OpportunityFeed />
    </main>
  );
}
