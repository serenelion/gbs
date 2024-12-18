'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import VoiceRecorder from './VoiceRecorder';
import { addDocument, uploadFile } from '@/lib/firebase/firebaseUtils';
import SignInWithGoogle from '../auth/SignInWithGoogle';
import { Trash2, Mic, Send } from 'lucide-react';
import AudioWrapper from '../ui/AudioWrapper';
import { useToast } from '@/lib/contexts/ToastContext';

export default function OpportunityForm() {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    adjustTextAreaHeight(e.target);
    if (!isTyping && newContent.trim() !== '') {
      setIsTyping(true);
    }
    if (newContent.trim() === '') {
      setIsTyping(false);
    }
  };

  const adjustTextAreaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    if ((e.nativeEvent as any)?.submitter?.getAttribute('aria-label') !== 'Share opportunity') {
      return;
    }

    const loadingId = toast.loading('Sharing your opportunity...');
    setIsSubmitting(true);
    try {
      let audioUrl: string | null = null;
      if (audioBlob) {
        const fileName = `audio/${user.uid}/${Date.now()}.webm`;
        audioUrl = await uploadFile(
          new File([audioBlob], fileName, { type: 'audio/webm' }),
          fileName
        );
      }

      await addDocument('opportunities', {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoUrl: user.photoURL || null,
        content: content.trim(),
        audioUrl,
        audioDuration: audioDuration,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: [],
      });
      
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      setAudioBlob(null);
      setAudioPreview(null);
      setContent('');
      setIsTyping(false);
      setAudioDuration(null);

      toast.close(loadingId);
      toast.success('Opportunity shared successfully! 🎉');
    } catch (error) {
      console.error('Error posting opportunity:', error);
      toast.close(loadingId);
      toast.error('Failed to share opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setAudioBlob(null);
    setAudioPreview(null);
    setContent('');
    setShowDeleteConfirm(false);
  };

  const handleTextFocus = () => {
    if (!user) {
      setShowAuth(true);
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
      {showAuth && !user ? (
        <div className="flex flex-col items-center justify-center py-6">
          <h3 className="text-lg font-medium mb-4">Sign in to share opportunities</h3>
          <SignInWithGoogle />
          <button
            type="button"
            onClick={() => setShowAuth(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <textarea
              value={content}
              onChange={handleTextChange}
              onFocus={handleTextFocus}
              placeholder="Share an opportunity..."
              className="w-full p-4 pr-24 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden min-h-[80px]"
              ref={(el) => {
                if (el) {
                  adjustTextAreaHeight(el);
                }
              }}
            />
            <div className="flex items-center gap-3">
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
                  aria-label="Share opportunity"
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
              onAudioRecorded={(blob, duration) => {
                console.log('Received audio duration:', duration);
                setAudioBlob(blob);
                setAudioPreview(URL.createObjectURL(blob));
                setAudioDuration(duration);
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
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Voice Note</h3>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                <AudioWrapper 
                  src={audioPreview}
                  onDelete={() => setShowDeleteConfirm(true)}
                  preventFormSubmission={true}
                  initialDuration={audioDuration || undefined}
                  onDurationChange={(duration) => {
                    console.log('AudioWrapper duration change:', duration);
                    if (!audioDuration && duration && isFinite(duration) && !isNaN(duration)) {
                      setAudioDuration(duration);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Delete Recording?</h3>
                <p className="text-gray-600 mb-4">
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
        </>
      )}
    </form>
  );
} 