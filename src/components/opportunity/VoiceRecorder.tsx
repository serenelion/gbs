'use client';

import { useState, useRef, useEffect } from 'react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { Mic, Square, Pause, Play, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveClient } from "@deepgram/sdk";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  onInteraction: () => void;
}

export default function VoiceRecorder({ onTranscription, onAudioRecorded, onInteraction }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  
  const { connectToDeepgram, disconnectFromDeepgram, realtimeTranscript } = useDeepgram();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const deepgramClientRef = useRef<LiveClient | null>(null);

  const handleStartRecording = async () => {
    onInteraction();
    chunksRef.current = [];
    setAudioUrl(null);
    setEditableTranscript('');
    
    try {
      // Get audio stream first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,
        } 
      });

      // Set up audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      // Connect to Deepgram
      const liveClient = await connectToDeepgram();
      if (liveClient) {
        deepgramClientRef.current = liveClient;
      }

      // Process audio data
      processor.onaudioprocess = (e) => {
        if (deepgramClientRef.current?.getReadyState() === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          deepgramClientRef.current.send(pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Set up MediaRecorder for saving the audio
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioRecorded(audioBlob);
        
        // Ensure the final transcript is set here as well
        const finalTranscript = realtimeTranscript.trim();
        setEditableTranscript(finalTranscript);
        
        // Clean up audio processing
        source.disconnect();
        processor.disconnect();
        audioContext.close();
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Set the final transcript before disconnecting from Deepgram
    const finalTranscript = realtimeTranscript.trim();
    setEditableTranscript(finalTranscript);
    onTranscription(finalTranscript); // Notify parent component of the final transcript
    
    // Clean up Deepgram connection
    disconnectFromDeepgram();
    setIsRecording(false);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setAudioUrl(null);
    setEditableTranscript('');
    setShowDeleteConfirm(false);
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src);
    }
  };

  const handleCreateOpportunity = () => {
    onTranscription(editableTranscript);
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isRecording 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>Record Voice</span>
            </>
          )}
        </button>

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="p-4 bg-white rounded-lg shadow-lg border">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-sm text-gray-500">Recording...</span>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {realtimeTranscript ? 'Transcribing...' : 'Waiting for speech...'}
            </p>
            {realtimeTranscript && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {realtimeTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {!isRecording && editableTranscript && (
        <div className="space-y-4">
          <textarea
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <button
            onClick={handleCreateOpportunity}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Opportunity
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Recording?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
} 