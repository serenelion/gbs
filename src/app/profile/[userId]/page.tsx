'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocuments } from '@/lib/firebase/firebaseUtils';
import OpportunityCard from '@/components/opportunity/OpportunityCard';
import { Opportunity } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOpportunities = async () => {
      try {
        const docs = await getDocuments<Opportunity>('opportunities', ['userId', '==', params.userId]);
        const sortedDocs = docs.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOpportunities(sortedDocs);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOpportunities();
  }, [params.userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={user?.photoURL || '/default-avatar.png'}
            alt={user?.displayName || 'User'}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{user?.displayName}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {opportunities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No opportunities shared yet
            </p>
          ) : (
            opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))
          )}
        </TabsContent>

        <TabsContent value="interactions">
          {/* Add interactions content here */}
        </TabsContent>
      </Tabs>
    </main>
  );
} 