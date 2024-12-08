'use client';

import { Github, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">
            Built with ❤️ for humanity. Open sourced in the spirit of gift.
          </p>
          
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/serenelion/gbs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Contribute</span>
            </Link>
            
            <Link
              href="https://github.com/sponsors/Giving-Back-Studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Sponsor</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 