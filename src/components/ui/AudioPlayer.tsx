'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  duration?: number;
  className?: string;
  onDelete?: () => void;
  preventFormSubmission?: boolean;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
}

export default function AudioPlayer({ 
  src, 
  duration,
  className = '', 
  onDelete,
  preventFormSubmission = false,
  onLoadedMetadata
}: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use provided duration if available, otherwise try to get it from the audio element
  const displayDuration = duration || (audioRef.current?.duration || 0);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setError('Failed to load audio');
    setIsLoading(false);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', () => setIsLoading(false));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', () => setIsLoading(false));
    };
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    if (preventFormSubmission) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePlayPause}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <div className="flex-1 space-y-2">
            <div className="relative h-1 bg-gray-200 rounded-full">
              <div
                className="absolute h-full bg-blue-600 rounded-full"
                style={{ width: `${(currentTime / displayDuration) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max={displayDuration}
                value={currentTime}
                onChange={handleSeek}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(displayDuration)}</span>
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

          <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </>
      )}
    </div>
  );
} 