'use client';

import AudioPlayer from './AudioPlayer';

export default function AudioWrapper({ src, onDelete }: { src: string, onDelete?: () => void }) {
  return (
    <div className="w-full">
      <AudioPlayer 
        src={src} 
        className="w-full"
        onDelete={onDelete}
      />
    </div>
  );
} 