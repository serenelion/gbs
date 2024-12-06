'use client';

import { useState, useRef } from 'react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  onInteraction: () => void;
}

export default function VoiceRecorder({ onTranscription, onAudioRecorded, onInteraction }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, realtimeTranscript } = useDeepgram();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    onInteraction();
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onAudioRecorded(audioBlob);
      };

      mediaRecorderRef.current.start();
      await connectToDeepgram();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    disconnectFromDeepgram();
    setIsRecording(false);
    
    if (realtimeTranscript) {
      onTranscription(realtimeTranscript);
    }
  };

  return (
    <div className="relative">
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

      {isRecording && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border">
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-sm text-gray-500">Recording...</span>
          </div>
          {realtimeTranscript && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {realtimeTranscript}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 