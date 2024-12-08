'use client';

import { motion, AnimatePresence } from 'framer-motion';
import SignInWithGoogle from './SignInWithGoogle';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Welcome to Giving Back Studio</h3>
                  <p className="text-gray-600">Sign in to share opportunities and engage with the community</p>
                </div>
                <SignInWithGoogle />
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 