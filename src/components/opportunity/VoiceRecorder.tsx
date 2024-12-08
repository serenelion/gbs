'use client';

import { useState, useRef, useEffect } from 'react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { Mic, Square, Pause, Play, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveClient } from "@deepgram/sdk";
import AudioPlayer from '../ui/AudioPlayer';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  onInteraction: () => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onTranscription, onAudioRecorded, onInteraction, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout>();
  const [realtimeText, setRealtimeText] = useState('');
  const transcriptBufferRef = useRef<string[]>([]);
  
  const { connectToDeepgram, disconnectFromDeepgram, realtimeTranscript, finalTranscript } = useDeepgram();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const deepgramClientRef = useRef<LiveClient | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update realtime display when transcription comes in
  useEffect(() => {
    if (isRecording && realtimeTranscript) {
      setRealtimeText(realtimeTranscript);
    }
  }, [realtimeTranscript, isRecording]);

  // Update final transcript when recording stops
  useEffect(() => {
    if (!isRecording && finalTranscript) {
      setEditableTranscript(finalTranscript);
      onTranscription(finalTranscript);
    }
  }, [finalTranscript, isRecording]);

  const handleStartRecording = async () => {
    setError(null);
    onInteraction();
    chunksRef.current = [];
    setAudioUrl(null);
    setEditableTranscript('');
    setIsProcessing(true);
    
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

      // Set up MediaRecorder with better error handling
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current.onerror = (event) => {
        setError('Recording failed. Please try again.');
        handleStopRecording();
      };

      // Clear any existing transcription timeout
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }

      // Debounce transcription updates
      transcriptionTimeoutRef.current = setTimeout(() => {
        const finalTranscript = realtimeTranscript.trim();
        if (finalTranscript !== editableTranscript) {
          setEditableTranscript(finalTranscript);
        }
      }, 500);

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
      setError('Could not access microphone. Please check permissions and try again.');
      setIsProcessing(false);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsAnalyzing(true); // Show analyzing state
    disconnectFromDeepgram();
    setIsRecording(false);

    // Create final audio blob
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    try {
      // Convert blob to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        // Get optimized transcription from API
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
        });
        
        const data = await response.json();
        if (data.transcription) {
          setEditableTranscript(data.transcription);
          onTranscription(data.transcription);
        }
        
        setIsAnalyzing(false);
        onAudioRecorded(audioBlob);
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      setIsAnalyzing(false);
      // Fallback to realtime transcript if analysis fails
      const fallbackTranscript = finalTranscript.trim();
      setEditableTranscript(fallbackTranscript);
      onTranscription(fallbackTranscript);
      onAudioRecorded(audioBlob);
    }
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
    chunksRef.current = [];
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    // Start recording automatically when component mounts
    handleStartRecording();
    return () => {
      // Cleanup when component unmounts
      if (mediaRecorderRef.current && isRecording) {
        handleStopRecording();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">Recording...</span>
            </div>
            <button
              onClick={handleStopRecording}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Stop recording"
            >
              <Square className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Realtime transcription display */}
          {realtimeText && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Transcribing in real-time...</div>
              <p className="text-gray-800">{realtimeText}</p>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-blue-800">Analyzing audio for accurate transcription...</span>
          </div>
        </div>
      )}

      {audioUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <AudioPlayer 
              src={audioUrl} 
              className="flex-1"
            />
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Delete recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700">
              Edit Transcript
            </label>
            <textarea
              id="transcript"
              value={editableTranscript}
              onChange={(e) => {
                setEditableTranscript(e.target.value);
                onTranscription(e.target.value);
              }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        </div>
      ) : null}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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