'use client';

import AudioPlayer from './AudioPlayer';

interface AudioWrapperProps {
  src: string;
  className?: string;
  onDelete?: () => void;
}

export default function AudioWrapper({ src, className = '', onDelete }: AudioWrapperProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
  };

  return (
    <div onClick={handleClick}>
      <AudioPlayer 
        src={src} 
        className={className} 
        onDelete={onDelete}
      />
    </div>
  );
} 