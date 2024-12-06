'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import AuthDialog from '../auth/AuthDialog';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Giving Back Studio
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h1>
        </Link>

        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                {user?.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1"
                  >
                    <Link
                      href={`/profile/${user.uid}`}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      </div>
    </header>
  );
} 