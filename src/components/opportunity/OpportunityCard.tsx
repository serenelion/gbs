'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Opportunity } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import AudioPlayer from '../ui/AudioPlayer';
import OpportunityReplyForm from './OpportunityReplyForm';
import { useState } from 'react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  hideNavigation?: boolean;
  onReplySuccess?: () => void;
}

export default function OpportunityCard({ opportunity, hideNavigation, onReplySuccess }: OpportunityCardProps) {
  const { user } = useAuth();

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          {opportunity.userPhotoUrl ? (
            <Image
              src={opportunity.userPhotoUrl}
              alt={opportunity.userName || 'User'}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{opportunity.userName || 'Anonymous'}</p>
            <p className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {!hideNavigation && (
          <Link
            href={`/opportunity/${opportunity.id}`}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-gray-50"
            onClick={(e) => e.stopPropagation()}
          >
            View thread
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
            {opportunity.content}
          </p>
        </div>
        
        {opportunity.audioUrl && (
          <div className="bg-gray-50 rounded-lg p-3">
            <AudioPlayer src={opportunity.audioUrl} />
          </div>
        )}
      </div>

      {!hideNavigation && (
        <div className="mt-6">
          <div className="h-px bg-gray-100 mb-6" />
          <OpportunityReplyForm
            opportunityId={opportunity.id}
            onSuccess={onReplySuccess}
          />
        </div>
      )}
    </>
  );

  const cardClasses = `
    bg-white rounded-xl shadow-sm border border-gray-100 p-5 
    ${!hideNavigation ? 'transition-all hover:shadow-md space-y-5' : 'space-y-4'}
  `;

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
} 