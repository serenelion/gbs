import HomeHeader from "@/components/home/HomeHeader";
import OpportunitySection from "@/components/OpportunitySection";

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <HomeHeader />
      <OpportunitySection />
    </main>
  );
}
