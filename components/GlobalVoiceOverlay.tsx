'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TomLogo from './TomLogo';
import { useListening } from '@/contexts/ListeningContext';

interface GlobalVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalVoiceOverlay({ isOpen, onClose }: GlobalVoiceOverlayProps) {
  const { voiceState, setVoiceState, setIsListening } = useListening();
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setVoiceState('listening');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleVoiceInput(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setVoiceState('idle');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Speech recognition ended');
        if (voiceState === 'listening') {
          setVoiceState('idle');
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudio();
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      setTranscript('');
      setResponse('');
      setError('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start listening');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
    setIsListening(false);
  };

  const handleVoiceInput = async (text: string) => {
    console.log('📝 Processing voice input:', text);
    setVoiceState('processing');
    setIsListening(false);

    try {
      const response = await fetch('/api/tom-chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setResponse(fullResponse);
        }
      }

      // Speak the response
      await speakMessage(fullResponse);

    } catch (error: any) {
      console.error('❌ Error processing voice input:', error);
      setError(error.message || 'Failed to process request');
      setVoiceState('idle');
    }
  };

  const speakMessage = async (text: string) => {
    // Stop any current audio
    stopAudio();

    setVoiceState('speaking');

    try {
      // Try OpenAI TTS first
      const ttsResponse = await fetch('/api/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'fable' })
      });

      if (ttsResponse.ok) {
        const contentType = ttsResponse.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          // Fallback to browser voice
          const data = await ttsResponse.json();
          if (data.useBrowserVoice) {
            useBrowserVoice(text);
            return;
          }
        } else {
          // Use OpenAI audio
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          currentAudioRef.current = audio;
          currentAudioUrlRef.current = audioUrl;

          audio.onended = () => {
            setVoiceState('idle');
            currentAudioRef.current = null;
            currentAudioUrlRef.current = null;
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            console.error('Audio playback error, falling back to browser voice');
            useBrowserVoice(text);
          };

          await audio.play();
          return;
        }
      }
    } catch (error) {
      console.error('TTS error, using browser voice:', error);
    }

    // Fallback to browser voice
    useBrowserVoice(text);
  };

  const useBrowserVoice = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setVoiceState('idle');
      };

      utterance.onerror = () => {
        setVoiceState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceState('idle');
    }
  };

  const stopAudio = () => {
    // Stop OpenAI audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }

    // Stop browser speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleClose = () => {
    stopListening();
    stopAudio();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[80vh] md:max-h-[600px] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TomLogo
                isListening={voiceState === 'listening'}
                isSpeaking={voiceState === 'speaking'}
                size={40}
              />
              <div>
                <h2 className="text-white font-bold text-lg">TOM AI Voice</h2>
                <p className="text-white/80 text-sm">
                  {voiceState === 'listening' ? 'Listening...' :
                   voiceState === 'processing' ? 'Processing...' :
                   voiceState === 'speaking' ? 'Speaking...' :
                   'Ready'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* Transcript */}
            {transcript && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-semibold mb-1">You said:</p>
                <p className="text-gray-800">{transcript}</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-sm text-teal-600 font-semibold mb-1">TOM says:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-semibold mb-1">Error:</p>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!transcript && !response && !error && (
              <div className="text-center py-12 text-gray-400">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Tap the mic button to start</p>
                <p className="text-sm mt-2">Ask me anything about theatre operations</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              {voiceState !== 'listening' ? (
                <button
                  onClick={startListening}
                  disabled={voiceState !== 'idle'}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    voiceState === 'idle'
                      ? 'bg-gradient-to-br from-blue-600 to-teal-600 hover:shadow-xl hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Mic className="w-8 h-8 text-white" />
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all shadow-lg animate-pulse"
                >
                  <MicOff className="w-8 h-8 text-white" />
                </button>
              )}
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              {voiceState === 'idle' ? 'Tap to speak' : voiceState === 'listening' ? 'Listening... Tap to stop' : 'Processing...'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
