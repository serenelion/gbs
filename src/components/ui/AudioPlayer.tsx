'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const isSetupDone = useRef(false);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current || isSetupDone.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (container) {
      const { width, height } = container.getBoundingClientRect();
      setCanvasWidth(width);
      setCanvasHeight(height);
      canvas.width = width;
      canvas.height = height;
    }

    const setupAudioContext = () => {
      if (audioContextRef.current) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      isSetupDone.current = true;
    };

    const handlePlay = () => {
      setupAudioContext();
    };

    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      isSetupDone.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (canvas.width / bufferLength) * 2.5;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#818CF8');
        ctx.fillStyle = gradient;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div ref={containerRef} className="relative h-24 flex-1">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full"
          />
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-4 p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
} 