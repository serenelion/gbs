interface OpportunityReplyFormProps {
  opportunityId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OpportunityReplyForm({ opportunityId, onClose, onSuccess }: OpportunityReplyFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      let audioUrl: string | undefined = undefined;
      if (audioBlob) {
        const fileName = `replies/${opportunityId}/${user.uid}/${Date.now()}.wav`;
        audioUrl = await uploadFile(
          new File([audioBlob], fileName),
          fileName
        );
      }

      await addDocument(`opportunities/${opportunityId}/replies`, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoUrl: user.photoURL || undefined,
        content: content.trim(),
        audioUrl,
        createdAt: new Date().toISOString(),
      });

      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      onSuccess();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        rows={2}
      />

      {audioPreview && (
        <div className="bg-gray-50 rounded-lg p-3">
          <AudioWrapper 
            src={audioPreview} 
            onDelete={() => {
              URL.revokeObjectURL(audioPreview);
              setAudioBlob(null);
              setAudioPreview(null);
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {!content && !audioPreview && (
          <VoiceRecorder 
            onTranscription={setContent}
            onAudioRecorded={(blob) => {
              setAudioBlob(blob);
              setAudioPreview(URL.createObjectURL(blob));
            }}
            onInteraction={() => {}}
          />
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Reply'}
          </button>
        </div>
      </div>
    </form>
  );
} 