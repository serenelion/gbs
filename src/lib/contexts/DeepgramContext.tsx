"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import { createContext, useContext, useState, ReactNode, useRef } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  realtimeTranscript: string;
  error: string | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/deepgram", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

export const DeepgramContextProvider: React.FC<DeepgramContextProviderProps> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<LiveClient | null>(null);

  const connectToDeepgram = async () => {
    try {
      if (clientRef.current) {
        clientRef.current.finish();
        clientRef.current = null;
      }
      setRealtimeTranscript("");

      const apiKey = await getApiKey();
      const client = createClient(apiKey);
      
      const liveClient = await client.listen.live({
        model: "nova-2",
        smart_format: true,
        language: "en",
        punctuate: true,
        interim_results: true,
        encoding: 'linear16',
        sample_rate: 48000,
        channels: 1,
      });

      liveClient.addListener(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
        setConnectionState(SOCKET_STATES.open);
        setError(null);
      });

      liveClient.addListener(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed normally');
        setConnectionState(SOCKET_STATES.closed);
      });

      liveClient.addListener(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        setError(typeof error === 'string' ? error : 'Unknown error occurred');
      });

      liveClient.addListener(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
        if (!data?.channel?.alternatives?.[0]) return;
        
        const transcript = data.channel.alternatives[0].transcript || "";
        if (transcript.trim()) {
          setRealtimeTranscript((prev) => {
            if (data.is_final) {
              return (prev + ' ' + transcript).trim();
            }
            return transcript.trim();
          });
        }
      });

      clientRef.current = liveClient;
      setConnectionState(SOCKET_STATES.connecting);
      return liveClient;
    } catch (err) {
      console.error('Deepgram connection error:', err);
      setError(err instanceof Error ? err.message : "Failed to connect to Deepgram");
      setConnectionState(SOCKET_STATES.closed);
      throw err;
    }
  };

  const disconnectFromDeepgram = () => {
    if (clientRef.current) {
      clientRef.current.finish();
      clientRef.current = null;
    }
    setConnectionState(SOCKET_STATES.closed);
    setRealtimeTranscript("");
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export const useDeepgram = () => {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
};

