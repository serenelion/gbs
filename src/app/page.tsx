import OpportunityFormWrapper from "@/components/opportunity/OpportunityFormWrapper";
import OpportunityFeedWrapper from "@/components/opportunity/OpportunityFeedWrapper";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          Giving Back Studio <Sparkles className="h-8 w-8 text-yellow-500" />
        </h1>
        <p className="text-gray-600">
          Connect and share opportunities with the social enterprise community
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Share an Opportunity</h2>
          <p className="text-gray-600 mb-4">
            Help grow the community by sharing opportunities for collaboration,
            funding, or support.
          </p>
          <OpportunityFormWrapper />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Community Opportunities</h2>
        <OpportunityFeedWrapper />
      </div>
    </main>
  );
}
