'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Mic, Send } from 'lucide-react';
import { addDocument, uploadFile } from '@/lib/firebase/firebaseUtils';
import VoiceRecorder from './VoiceRecorder';
import AudioWrapper from '../ui/AudioWrapper';
import SignInWithGoogle from '../auth/SignInWithGoogle';

interface OpportunityReplyFormProps {
  opportunityId: string;
  onSuccess: () => void;
}

export default function OpportunityReplyForm({ opportunityId, onSuccess }: OpportunityReplyFormProps) {
  const { user, loading } = useAuth();
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-sm border p-6">
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!user && !showAuth) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-lg font-medium mb-4">Sign in to join the conversation</h3>
        <SignInWithGoogle />
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsTyping(newContent.trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      let audioUrl = null;
      if (audioBlob) {
        const fileName = `replies/${opportunityId}/${user.uid}/${Date.now()}.wav`;
        audioUrl = await uploadFile(
          new File([audioBlob], fileName),
          fileName
        );
      }

      const replyData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoUrl: user.photoURL || null,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        ...(audioUrl && { audioUrl })
      };

      await addDocument(`opportunities/${opportunityId}/replies`, replyData);

      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      setAudioBlob(null);
      setAudioPreview(null);
      setContent('');
      setIsTyping(false);
      setShowVoiceRecorder(false);
      onSuccess();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setContent('');
    setIsTyping(false);
    setAudioPreview(null);
    setShowVoiceRecorder(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {audioPreview && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Voice Note Transcription
              </span>
              <span>Edit only to fix transcription errors</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <textarea
            value={content}
            onChange={handleTextChange}
            placeholder={audioPreview ? "Edit transcription if needed..." : "Write a reply..."}
            className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
          />
          {!isTyping && !audioPreview && !showVoiceRecorder ? (
            <button
              type="button"
              onClick={handleRecordClick}
              className="flex-shrink-0 p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              aria-label="Record voice note"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={`flex-shrink-0 p-3 rounded-full transition-colors ${
                isSubmitting || !content.trim()
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-label="Send reply"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showVoiceRecorder && (
        <VoiceRecorder 
          onTranscription={(text) => {
            setContent(text);
            setIsTyping(false);
          }}
          onAudioRecorded={(blob) => {
            setAudioBlob(blob);
            setAudioPreview(URL.createObjectURL(blob));
            setShowVoiceRecorder(false);
          }}
          onInteraction={() => {
            if (!user) setShowAuth(true);
          }}
          onCancel={() => {
            setShowVoiceRecorder(false);
            setContent('');
          }}
        />
      )}

      {audioPreview && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <AudioWrapper 
            src={audioPreview}
            onDelete={() => {
              URL.revokeObjectURL(audioPreview);
              setAudioBlob(null);
              setAudioPreview(null);
              setContent('');
            }}
          />
        </div>
      )}

      {showAuth && !user && (
        <div className="bg-white/95 rounded-lg p-6 text-center shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Sign in to reply</h3>
          <SignInWithGoogle />
        </div>
      )}
    </form>
  );
} 