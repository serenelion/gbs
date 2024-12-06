'use client';

import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebase';

export function useAudioHandler(audioUrl: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false);
      return;
    }

    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For blob URLs (preview in form)
        if (audioUrl.startsWith('blob:')) {
          setObjectUrl(audioUrl);
          setIsLoading(false);
          return;
        }

        // For Firebase Storage URLs
        const storageRef = ref(storage, audioUrl);
        const downloadUrl = await getDownloadURL(storageRef);
        setObjectUrl(downloadUrl);
      } catch (err) {
        console.error('Error loading audio:', err);
        setError('Failed to load audio');
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  return { isLoading, error, objectUrl };
} 