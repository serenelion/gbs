'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  className?: string;
  onDelete?: () => void;
}

export default function AudioPlayer({ src, className, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleLoadMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm text-center">{error}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            <div 
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer"
            >
              <div 
                className="h-full bg-blue-500 rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow" />
              </div>
            </div>

            <button
              onClick={handleMuteToggle}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <span className="text-sm text-gray-600 min-w-[4rem]">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
} 