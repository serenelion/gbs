'use client';

import { useState, useRef, useEffect } from 'react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { Mic, Square, Pause, Play, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveClient } from "@deepgram/sdk";
import AudioPlayer from '../ui/AudioPlayer';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioRecorded: (audioBlob: Blob, duration: number) => void;
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [isPostProcessing, setIsPostProcessing] = useState(false);
  const [finalProcessedTranscript, setFinalProcessedTranscript] = useState('');
  const recordingStartTimeRef = useRef<number | null>(null);
  const finalTranscriptTimeoutRef = useRef<NodeJS.Timeout>();
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // Update realtime display when transcription comes in
  useEffect(() => {
    if (isRecording && realtimeTranscript) {
      setRealtimeText(realtimeTranscript);
    }
  }, [realtimeTranscript, isRecording]);

  // Update final transcript handling with better state management
  useEffect(() => {
    if (!isRecording && (finalTranscript || realtimeText)) {
      // Clear any existing timeout
      if (finalTranscriptTimeoutRef.current) {
        clearTimeout(finalTranscriptTimeoutRef.current);
      }

      // Immediately update with what we have
      const currentTranscript = finalTranscript || realtimeText;
      setEditableTranscript(currentTranscript);
      onTranscription(currentTranscript);

      // Set a timeout to catch any final updates
      finalTranscriptTimeoutRef.current = setTimeout(() => {
        const completeTranscript = finalTranscript || realtimeText;
        if (completeTranscript !== currentTranscript) {
          setEditableTranscript(completeTranscript);
          onTranscription(completeTranscript);
        }
        setIsPostProcessing(false);
      }, 2000);
    }

    return () => {
      if (finalTranscriptTimeoutRef.current) {
        clearTimeout(finalTranscriptTimeoutRef.current);
      }
    };
  }, [finalTranscript, isRecording, realtimeText, onTranscription]);

  const handleStartRecording = async () => {
    setError(null);
    onInteraction();
    chunksRef.current = [];
    setAudioUrl(null);
    setEditableTranscript('');
    setIsProcessing(true);
    recordingStartTimeRef.current = Date.now();
    
    try {
      // Get audio stream with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Create and store AudioContext with consistent sample rate
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });

      // Create and store audio source
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create processor with larger buffer for stability
      processorRef.current = audioContextRef.current.createScriptProcessor(8192, 1, 1);

      // Connect to Deepgram with error handling
      try {
        const liveClient = await connectToDeepgram();
        if (liveClient) {
          deepgramClientRef.current = liveClient;
        }
      } catch (error) {
        console.error('Deepgram connection failed:', error);
        throw new Error('Failed to connect to transcription service');
      }

      // Optimized audio processing
      processorRef.current.onaudioprocess = (e) => {
        if (deepgramClientRef.current?.getReadyState() === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          
          // Optimize audio conversion with buffer
          const buffer = new Float32Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            buffer[i] = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = buffer[i] < 0 ? buffer[i] * 0x8000 : buffer[i] * 0x7FFF;
          }
          
          deepgramClientRef.current.send(pcmData.buffer);
        }
      };

      // Connect audio nodes
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // Set up MediaRecorder with single continuous stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        bitsPerSecond: 128000
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Start recording as a single continuous stream
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Recording setup failed:', error);
      cleanupAudioResources();
      setError('Could not access microphone. Please check permissions and try again.');
      setIsProcessing(false);
    }
  };

  const cleanupAudioResources = () => {
    try {
      // Stop media recorder first
      if (mediaRecorderRef.current?.state !== 'inactive') {
        try {
          mediaRecorderRef.current?.stop();
        } catch (e) {
          console.warn('Error stopping media recorder:', e);
        }
      }

      // Stop all tracks
      try {
        mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.warn('Error stopping media tracks:', e);
      }

      // Clean up audio processing chain in order
      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch (e) {
          console.warn('Error disconnecting processor:', e);
        }
        processorRef.current = null;
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          console.warn('Error disconnecting source:', e);
        }
        sourceRef.current = null;
      }

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.warn('Error closing audio context:', e);
        }
        audioContextRef.current = null;
      }

      // Clean up Deepgram connection last
      if (deepgramClientRef.current) {
        disconnectFromDeepgram();
        deepgramClientRef.current = null;
      }

      // Reset media recorder
      mediaRecorderRef.current = null;
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  };

  const getDuration = async (audioBlob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      // First try to get duration from recording time as it's more reliable
      const recordingDuration = (Date.now() - (recordingStartTimeRef.current || Date.now())) / 1000;
      console.log('Recording time duration:', recordingDuration);

      // Create a new blob with explicit MIME type and codec
      const properBlob = new Blob([audioBlob], { 
        type: 'audio/webm;codecs=opus' 
      });

      // Create an off-screen audio element for validation
      const audio = new Audio();
      const blobUrl = URL.createObjectURL(properBlob);
      let durationResolved = false;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError);
        clearTimeout(timeoutId);
      };

      const handleLoadedMetadata = () => {
        const metadataDuration = audio.duration;
        console.log('Metadata duration:', metadataDuration);
        
        if (!durationResolved) {
          durationResolved = true;
          cleanup();
          // Use recording time as it's more reliable
          resolve(recordingDuration);
        }
      };

      const handleError = () => {
        if (!durationResolved) {
          console.log('Using recording time due to metadata error');
          durationResolved = true;
          cleanup();
          resolve(recordingDuration);
        }
      };

      const timeoutId = setTimeout(() => {
        if (!durationResolved) {
          console.log('Metadata loading timed out, using recording time');
          handleError();
        }
      }, 1000);

      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError);
      audio.src = blobUrl;
    });
  };

  const handleStopRecording = async () => {
    setIsAnalyzing(true);
    setIsPostProcessing(true);

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        const currentText = realtimeText;
        setEditableTranscript(currentText);
        onTranscription(currentText);

        mediaRecorderRef.current.stop();
        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => resolve();
          } else {
            resolve();
          }
        });
      }

      // Create audio blob with explicit codec
      const audioBlob = new Blob(chunksRef.current, { 
        type: 'audio/webm;codecs=opus' 
      });

      // Get duration and ensure it's valid
      const duration = await getDuration(audioBlob);
      console.log('Final validated duration:', duration);

      // Create URL and update state
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setAudioDuration(duration);

      // Pass both blob and duration to parent
      onAudioRecorded(audioBlob, duration);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('Stop recording error:', error);
      setError('Failed to process recording');
      setIsPostProcessing(false);
      setIsAnalyzing(false);
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

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
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

      {(isRecording || isAnalyzing || isPostProcessing) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {isRecording ? 'Recording...' : isPostProcessing ? 'Finalizing transcription...' : 'Processing audio...'}
              </span>
            </div>
            {isRecording && (
              <button
                onClick={handleStopRecording}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Stop recording"
              >
                <Square className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Updated transcription display */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              {isRecording ? 'Transcribing in real-time...' : 
               isPostProcessing ? 'Finalizing transcription...' : 
               'Processing audio...'}
            </div>
            <p className="text-gray-800">{realtimeText}</p>
            {(isAnalyzing || isPostProcessing) && (
              <div className="flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                <span className="text-sm text-blue-800">
                  {isPostProcessing ? 'Capturing final transcription...' : 'Processing audio...'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show editing interface only when processing is complete */}
      {audioUrl && !isPostProcessing && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <AudioPlayer 
              src={audioUrl} 
              className="flex-1"
              key={audioUrl} // Force re-render on new audio
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
                const newValue = e.target.value;
                setEditableTranscript(newValue);
                onTranscription(newValue);
                // Adjust height
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden min-h-[96px]"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      )}

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