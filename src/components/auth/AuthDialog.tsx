'use client';

import { motion, AnimatePresence } from 'framer-motion';
import SignInWithGoogle from './SignInWithGoogle';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 w-full max-w-sm"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Welcome to Giving Back Studio</h3>
              <p className="text-gray-600 mb-6">Sign in to share opportunities and engage with the community</p>
              <SignInWithGoogle />
              <button
                onClick={onClose}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 