'use client';

import { useEffect, useState } from 'react';
import { getDocuments } from '@/lib/firebase/firebaseUtils';
import OpportunityCard from './OpportunityCard';
import { Opportunity } from '@/lib/types';

export default function OpportunityFeed() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const docs = await getDocuments('opportunities');
        const sortedDocs = docs.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOpportunities(sortedDocs as Opportunity[]);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-6 h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No opportunities shared yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  );
} 