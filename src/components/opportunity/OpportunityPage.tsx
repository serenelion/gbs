'use client';

import { useEffect, useState } from 'react';
import { getDocumentById, getDocuments } from '@/lib/firebase/firebaseUtils';
import { Opportunity, Reply } from '@/lib/types';
import OpportunityCard from './OpportunityCard';
import OpportunityReplyForm from './OpportunityReplyForm';
import OpportunityReply from './OpportunityReply';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface OpportunityPageProps {
  params: {
    id: string;
  };
}

export default function OpportunityPage({ params }: OpportunityPageProps) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOpportunityAndReplies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate ID parameter
      if (!params.id) {
        setError('Invalid opportunity ID');
        return;
      }

      const opportunityData = await getDocumentById<Opportunity>('opportunities', params.id);
      if (!opportunityData) {
        setError('Opportunity not found');
        return;
      }
      
      setOpportunity(opportunityData);

      const repliesData = await getDocuments<Reply>(`opportunities/${params.id}/replies`);
      const sortedReplies = repliesData.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setReplies(sortedReplies);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setError('Failed to load opportunity. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunityAndReplies();
  }, [params.id]);

  const handleReplySuccess = async () => {
    setIsRefreshing(true);
    try {
      const newReplies = await getDocuments<Reply>(`opportunities/${params.id}/replies`);
      const sortedReplies = newReplies.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setReplies(sortedReplies);
    } catch (error) {
      console.error('Error refreshing replies:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded mb-8" />
          <div className="h-40 bg-gray-200 rounded-lg mb-8" />
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Opportunity not found'}</h1>
          <Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </Link>

      <OpportunityCard 
        opportunity={opportunity}
        hideNavigation
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">
          Responses ({replies.length})
        </h2>

        <div className="mb-8">
          <OpportunityReplyForm
            opportunityId={params.id}
            onSuccess={handleReplySuccess}
          />
        </div>

        <div className="space-y-6">
          {isRefreshing ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {replies.map((reply) => (
                <OpportunityReply 
                  key={reply.id} 
                  reply={reply}
                />
              ))}
              
              {replies.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No responses yet. Be the first to respond!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
} 