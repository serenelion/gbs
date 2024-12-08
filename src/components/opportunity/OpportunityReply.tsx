'use client';

import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import Image from 'next/image';
import AudioPlayer from '../ui/AudioPlayer';

interface OpportunityReplyProps {
  reply: {
    id: string;
    userId: string;
    userName: string;
    userPhotoUrl?: string;
    content: string;
    audioUrl?: string;
    createdAt: string;
  };
}

export default function OpportunityReply({ reply }: OpportunityReplyProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-start gap-3 mb-4">
        {reply.userPhotoUrl ? (
          <Image
            src={reply.userPhotoUrl}
            alt={reply.userName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <div>
          <p className="font-medium">{reply.userName}</p>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
      </div>

      {reply.audioUrl && (
        <AudioPlayer src={reply.audioUrl} />
      )}
    </div>
  );
} 