'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import VoiceRecorder from './VoiceRecorder';
import { addDocument, uploadFile } from '@/lib/firebase/firebaseUtils';
import SignInWithGoogle from '../auth/SignInWithGoogle';
import { Trash2 } from 'lucide-react';
import AudioWrapper from '../ui/AudioWrapper';

export default function OpportunityForm() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      let audioUrl = null;
      if (audioBlob) {
        const fileName = `audio/${user.uid}/${Date.now()}.wav`;
        audioUrl = await uploadFile(
          new File([audioBlob], fileName),
          fileName
        );
      }

      await addDocument('opportunities', {
        userId: user.uid,
        content: content.trim(),
        audioUrl,
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
    } catch (error) {
      console.error('Error posting opportunity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudioRecorded = (blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioPreview(url);
  };

  const handleDeleteRecording = () => {
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
  };

  const handleInteraction = () => {
    if (!user) {
      setShowAuth(true);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsEditing(!!e.target.value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white rounded-lg p-6 shadow-sm border">
      <textarea
        value={content}
        onChange={handleContentChange}
        onFocus={handleInteraction}
        placeholder="Share an opportunity with the community..."
        className="w-full p-4 border border-gray-200 rounded-lg mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
      />

      {audioPreview && (
        <div className="relative mb-4">
          <AudioWrapper 
            src={audioPreview} 
            onDelete={handleDeleteRecording}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {!isEditing && !audioPreview && (
          <VoiceRecorder 
            onTranscription={setContent}
            onAudioRecorded={handleAudioRecorded}
            onInteraction={handleInteraction}
          />
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !user}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ml-auto"
        >
          {isSubmitting ? 'Sharing...' : 'Share Opportunity'}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-lg backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-2">Delete Recording?</h3>
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

      {showAuth && !user && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-lg backdrop-blur-sm">
          <div className="text-center p-6">
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
        </div>
      )}
    </form>
  );
} 