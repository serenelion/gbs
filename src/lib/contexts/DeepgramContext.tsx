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
      const apiKey = await getApiKey();
      const client = createClient(apiKey);
      
      const liveClient = await client.listen.live({
        model: "nova-2",
        smart_format: true,
        language: "en",
      });

      liveClient.on(LiveTranscriptionEvents.Open, () => {
        setConnectionState(SOCKET_STATES.open);
        setError(null);
      });

      liveClient.on(LiveTranscriptionEvents.Close, () => {
        setConnectionState(SOCKET_STATES.closed);
      });

      liveClient.on(LiveTranscriptionEvents.Error, (error) => {
        setError(error.message);
        setConnectionState(SOCKET_STATES.closed);
      });

      liveClient.on(LiveTranscriptionEvents.Transcript, (transcript: LiveTranscriptionEvent) => {
        const text = transcript.channel?.alternatives[0]?.text || "";
        setRealtimeTranscript((prev) => prev + " " + text);
      });

      clientRef.current = liveClient;
      setConnectionState(SOCKET_STATES.connecting);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Deepgram");
      setConnectionState(SOCKET_STATES.closed);
    }
  };

  const disconnectFromDeepgram = () => {
    clientRef.current?.finish();
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

