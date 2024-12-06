'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateDocument } from '@/lib/firebase/firebaseUtils';
import { Opportunity } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import AudioWrapper from '../ui/AudioWrapper';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const hasLiked = user ? opportunity.likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    
    setIsLiking(true);
    try {
      const updatedLikes = hasLiked
        ? opportunity.likes.filter(id => id !== user.uid)
        : [...opportunity.likes, user.uid];
      
      await updateDocument('opportunities', opportunity.id, {
        likes: updatedLikes
      });
      
      opportunity.likes = updatedLikes;
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {opportunity.userPhotoUrl ? (
            <Image
              src={opportunity.userPhotoUrl}
              alt={opportunity.userName || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium">{opportunity.userName || 'Anonymous'}</p>
            <p className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{opportunity.content}</p>
      </div>
      
      {opportunity.audioUrl && (
        <AudioWrapper src={opportunity.audioUrl} className="mb-4" />
      )}

      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          onClick={handleLike}
          disabled={!user || isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            hasLiked 
              ? 'bg-red-50 text-red-500 hover:bg-red-100' 
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{opportunity.likes.length}</span>
        </button>

        <Link
          href={`/opportunity/${opportunity.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{opportunity.replies?.length || 0}</span>
        </Link>
      </div>
    </div>
  );
} 