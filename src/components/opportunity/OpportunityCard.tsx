'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Opportunity } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import AudioPlayer from '../ui/AudioPlayer';

interface OpportunityCardProps {
  opportunity: Opportunity;
  hideNavigation?: boolean;
}

export default function OpportunityCard({ opportunity, hideNavigation }: OpportunityCardProps) {
  const { user } = useAuth();

  const cardContent = (
    <>
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
        <AudioPlayer src={opportunity.audioUrl} className="mb-4" />
      )}

      {!hideNavigation && (
        <div className="flex items-center gap-4 pt-4 border-t">
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{opportunity.replies?.length || 0} replies</span>
          </span>
        </div>
      )}
    </>
  );

  if (hideNavigation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {cardContent}
      </div>
    );
  }

  return (
    <Link 
      href={`/opportunity/${opportunity.id}`}
      className="block transition-transform hover:-translate-y-1"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {cardContent}
      </div>
    </Link>
  );
} 