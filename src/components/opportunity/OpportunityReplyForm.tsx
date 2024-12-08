'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Mic, Send, Loader2, Trash2 } from 'lucide-react';
import { addDocument, uploadFile } from '@/lib/firebase/firebaseUtils';
import VoiceRecorder from './VoiceRecorder';
import AudioWrapper from '../ui/AudioWrapper';
import SignInWithGoogle from '../auth/SignInWithGoogle';
import { useToast } from '@/lib/contexts/ToastContext';

interface OpportunityReplyFormProps {
  opportunityId: string;
  onSuccess: () => void;
}

export default function OpportunityReplyForm({ opportunityId, onSuccess }: OpportunityReplyFormProps) {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecorderLoading, setIsRecorderLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (!user || !content.trim() || isSubmitting) return;

    const loadingId = toast.loading('Sending your reply...');
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
      
      toast.close(loadingId);
      toast.success('Reply posted successfully! 🎉');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.close(loadingId);
      toast.error('Failed to post your reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordClick = () => {
    setShowVoiceRecorder(true);
    setIsRecorderLoading(true);
    setTimeout(() => setIsRecorderLoading(false), 1000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioBlob(null);
    setAudioPreview(null);
    setContent('');
    setShowDeleteConfirm(false);
    setIsTyping(false);
    setShowVoiceRecorder(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {audioPreview && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Voice Note Transcription
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
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
            disabled={isSubmitting}
          />
          {!isTyping && !audioPreview && !showVoiceRecorder ? (
            <button
              type="button"
              onClick={handleRecordClick}
              disabled={isSubmitting}
              className={`flex-shrink-0 p-3 rounded-full transition-colors ${
                isSubmitting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-label="Send reply"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {showVoiceRecorder && (
        <div className={`transition-opacity duration-200 ${isRecorderLoading ? 'opacity-50' : 'opacity-100'}`}>
          <VoiceRecorder 
            onTranscription={(text) => {
              if (!showVoiceRecorder) return;
              setContent(text);
              setIsTyping(false);
              setIsRecorderLoading(false);
            }}
            onAudioRecorded={(blob) => {
              setAudioBlob(blob);
              setAudioPreview(URL.createObjectURL(blob));
              setShowVoiceRecorder(false);
              setIsRecorderLoading(false);
            }}
            onInteraction={() => {
              if (!user) setShowAuth(true);
            }}
            onCancel={() => {
              setShowVoiceRecorder(false);
              setContent('');
              setIsRecorderLoading(false);
              setIsTyping(false);
            }}
          />
        </div>
      )}

      {audioPreview && (
        <div className={`bg-white rounded-lg shadow-sm border p-4 transition-opacity duration-200 ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}>
          <AudioWrapper 
            src={audioPreview}
            onDelete={() => {
              handleDelete();
            }}
            disabled={isSubmitting}
          />
        </div>
      )}

      {showAuth && !user && (
        <div className="bg-white/95 rounded-lg p-6 text-center shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Sign in to reply</h3>
          <SignInWithGoogle />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Recording?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete both the voice note and its transcription. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
} 