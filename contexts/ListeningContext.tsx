'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ListeningContextType {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
}

const ListeningContext = createContext<ListeningContextType | undefined>(undefined);

export function ListeningProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');

  return (
    <ListeningContext.Provider value={{ isListening, setIsListening, voiceState, setVoiceState }}>
      {children}
    </ListeningContext.Provider>
  );
}

export function useListening() {
  const context = useContext(ListeningContext);
  if (context === undefined) {
    return { isListening: false, setIsListening: () => {}, voiceState: 'idle' as VoiceState, setVoiceState: () => {} };
  }
  return context;
}
