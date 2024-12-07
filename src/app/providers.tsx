'use client';

import { DeepgramContextProvider } from "@/lib/contexts/DeepgramContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DeepgramContextProvider>
        {children}
      </DeepgramContextProvider>
    </AuthProvider>
  );
} 