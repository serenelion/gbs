'use client';

import AudioPlayer from './AudioPlayer';
import { Pause, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AudioWrapperProps {
  src: string;
  onDelete?: () => void;
  preventFormSubmission?: boolean;
  initialDuration?: number;
  onDurationChange?: (duration: number) => void;
}

export default function AudioWrapper({ 
  src, 
  onDelete, 
  preventFormSubmission = false,
  initialDuration,
  onDurationChange 
}: AudioWrapperProps) {
  const [duration, setDuration] = useState<number | undefined>(initialDuration);

  // Only try to get duration from audio element if we don't have a valid initial duration
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audioDuration = (e.target as HTMLAudioElement).duration;
    console.log('AudioWrapper loaded metadata duration:', audioDuration);
    
    if (!duration && audioDuration && isFinite(audioDuration) && !isNaN(audioDuration)) {
      console.log('Setting new duration from metadata:', audioDuration);
      setDuration(audioDuration);
      onDurationChange?.(audioDuration);
    } else if (duration) {
      console.log('Using existing duration:', duration);
    }
  };

  // Use the initial duration if provided
  useEffect(() => {
    if (initialDuration && isFinite(initialDuration) && !isNaN(initialDuration)) {
      console.log('Using initial duration:', initialDuration);
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  return (
    <div className="w-full">
      <AudioPlayer
        src={src}
        duration={duration}
        onDelete={onDelete}
        preventFormSubmission={preventFormSubmission}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
} 