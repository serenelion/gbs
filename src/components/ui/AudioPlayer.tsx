'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  className?: string;
  onDelete?: () => void;
}

export default function AudioPlayer({ src, className = '', onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementSourceNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioData([]);

    const initializeAudio = async () => {
      try {
        // Force load audio metadata
        await audio.load();
        
        if (audio.readyState >= 1) {
          const audioDuration = audio.duration;
          if (isFinite(audioDuration) && audioDuration > 0) {
            setDuration(audioDuration);
          }
        }

        initializeAudioContext();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    const initializeAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      if (isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
    };

    const handleDurationChange = () => {
      const audioDuration = audio.duration;
      if (isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    
    initializeAudio();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Cleanup audio context and source
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [src]); // Re-run when src changes

  useEffect(() => {
    if (isPlaying) {
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(Array.from(dataArray));
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioData([]); // Clear visualizer when not playing
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current || !progressBarContainerRef.current || !duration) return;
    
    const rect = progressBarContainerRef.current.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickPosition / rect.width;
    const newTime = Math.min(Math.max(0, percentage * duration), duration);
    
    if (isFinite(newTime) && newTime >= 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressBarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current || !progressBarContainerRef.current || !duration) return;
    
    const rect = progressBarContainerRef.current.getBoundingClientRect();
    const dragPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = dragPosition / rect.width;
    const newTime = Math.min(Math.max(0, percentage * duration), duration);
    
    if (isFinite(newTime) && newTime >= 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`${className} bg-gray-50 rounded-lg p-4`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio 
        ref={audioRef} 
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          if (!isDragging && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
      />
      
      <div className="flex flex-col gap-4">
        <div className={`h-24 bg-gray-100 rounded-lg overflow-hidden ${!isPlaying && 'hidden'}`}>
          <div className="h-full flex items-end justify-around">
            {audioData.slice(0, 64).map((value, index) => (
              <div
                key={index}
                className="w-1 bg-blue-500 rounded-t"
                style={{
                  height: `${(value / 255) * 100}%`,
                  opacity: isPlaying ? 1 : 0.5,
                  transition: 'height 0.1s ease'
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-gray-700" />
            ) : (
              <Play className="w-6 h-6 text-gray-700" />
            )}
          </button>

          <div className="flex-1">
            <div
              ref={progressBarContainerRef}
              className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressBarClick}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
                handleProgressBarDrag(e);
              }}
            >
              <div
                className="absolute h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ 
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full -ml-1.5 transition-all duration-100"
                style={{ 
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 