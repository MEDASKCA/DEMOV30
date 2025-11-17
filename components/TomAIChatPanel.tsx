'use client';

import React, { useState, useRef, useEffect } from 'react';
import TomLogo from './TomLogo';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TomAIChatPanelProps {
  showHeader?: boolean;
}

export default function TomAIChatPanel({ showHeader = true }: TomAIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello Alexander! How can I help you with theatre operations today? Just start speaking when you're ready.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceUiMode, setVoiceUiMode] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Derived states for backwards compatibility
  const isSpeaking = voiceUiMode === 'speaking';
  const isListening = voiceUiMode === 'listening';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceModeRecognitionRef = useRef<any>(null);
  const isStoppingVoiceMode = useRef(false);
  const isSpeakingRef = useRef(false);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Recording Mode Speech Recognition (mic button)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-GB';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = (finalTranscript + interimTranscript).trim();
        setInputMessage(currentText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Recording error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Initialize Voice Mode Speech Recognition (conversational)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      voiceModeRecognitionRef.current = new SpeechRecognition();
      voiceModeRecognitionRef.current.continuous = true;
      voiceModeRecognitionRef.current.interimResults = true;
      voiceModeRecognitionRef.current.lang = 'en-GB';

      let autoSendTimeout: NodeJS.Timeout | null = null;
      let accumulatedText = '';

      voiceModeRecognitionRef.current.onresult = (event: any) => {
        // Cancel any ongoing speech when user starts talking
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // Clear previous auto-send timer
        if (autoSendTimeout) {
          clearTimeout(autoSendTimeout);
          autoSendTimeout = null;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          accumulatedText += finalTranscript;
        }

        const currentText = (accumulatedText + interimTranscript).trim();
        setInputMessage(currentText);

        // Auto-send after 1.5 seconds of silence
        if (finalTranscript.trim()) {
          autoSendTimeout = setTimeout(() => {
            const textToSend = accumulatedText.trim();
            if (textToSend) {
              accumulatedText = '';
              setVoiceUiMode('thinking'); // user-speech-end event
              handleSendMessage();
            }
          }, 1500);
        }
      };

      voiceModeRecognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' && isVoiceMode) {
          setTimeout(() => {
            try {
              voiceModeRecognitionRef.current?.start();
            } catch (e) {}
          }, 100);
        } else {
          setIsVoiceMode(false);
        }
      };

      voiceModeRecognitionRef.current.onend = () => {
        // Don't restart if TOM is speaking or voice mode is stopped
        if (isVoiceMode && !isStoppingVoiceMode.current && !isSpeakingRef.current) {
          try {
            voiceModeRecognitionRef.current?.start();
          } catch (e) {}
        }
      };
    }
  }, [isVoiceMode]);

  const handleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleVoiceMode = () => {
    // If turning OFF voice mode, always allow it
    if (isVoiceMode) {
      isStoppingVoiceMode.current = true;
      try {
        voiceModeRecognitionRef.current?.stop();
      } catch (e) {
        console.log('Error stopping voice recognition:', e);
      }
      setIsVoiceMode(false);
      setVoiceUiMode('idle'); // mic-close event
      setInputMessage('');
      return;
    }

    // If turning ON voice mode, check support
    if (!voiceModeRecognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    isStoppingVoiceMode.current = false;
    try {
      voiceModeRecognitionRef.current.start();
      setIsVoiceMode(true);
      setVoiceUiMode('listening'); // mic-open event
    } catch (e) {
      console.error('Error starting voice recognition:', e);
      alert('Could not start voice mode. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const query = inputMessage;
      setInputMessage('');

      // Create a streaming message
      const streamingMessageId = 'streaming-' + Date.now();
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, streamingMessage]);

      try {
        // Try Azure OpenAI endpoint first
        const response = await fetch('/api/tom-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query })
        });

        if (response.ok) {
          const result = await response.json();

          setMessages(prev => prev.map(m =>
            m.id === streamingMessageId
              ? { ...m, content: result.message }
              : m
          ));

          // Speak the response
          if ('speechSynthesis' in window && result.message) {
            speakMessage(result.message);
          }
        } else {
          throw new Error('Azure OpenAI request failed');
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages(prev => prev.map(m =>
          m.id === streamingMessageId
            ? { ...m, content: 'I encountered an error processing your request. Please try again.' }
            : m
        ));
      }
    }
  };

  const speakMessage = async (text: string) => {
    // Cancel any ongoing speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    // Use browser speech synthesis
    speakWithBrowserVoice(text);
  };

  const speakWithBrowserVoice = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.log('Browser speech synthesis not available');
      setIsSpeaking(false);
      return;
    }

    console.log('Using browser voice');

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      console.log('Available voices:', voices.length);

      // Prioritize natural-sounding voices
      let selectedVoice = null;
      const preferredVoices = [
        // Premium voices (most natural)
        'Samantha',
        'Alex',
        'Google UK English Female',
        'Google UK English Male',
        'Google US English',
        'Microsoft Zira - English (United States)',
        'Microsoft David - English (United States)',
        'Microsoft Mark - English (United States)',
        // Enhanced voices
        'Daniel (Enhanced)',
        'Fiona (Enhanced)',
        'Karen (Enhanced)',
        // Standard voices
        'Daniel',
        'Fiona',
        'Karen',
        'Moira',
        'Tessa'
      ];

      for (const prefName of preferredVoices) {
        selectedVoice = voices.find(v => v.name === prefName);
        if (selectedVoice) break;
      }

      // Fallback: find any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.lang.startsWith('en-') &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
      }

      // Last resort: any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        console.log('Selected voice:', selectedVoice.name);
      } else {
        utterance.lang = 'en-GB';
        console.log('No specific voice found, using default en-GB');
      }

      // Natural speech settings
      utterance.rate = 0.95;  // Slightly slower for clarity
      utterance.pitch = 1.0;  // Normal pitch (not robotic)
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('Speech started');
        isSpeakingRef.current = true;
        setVoiceUiMode('speaking'); // assistant-audio-start event
        // Stop listening to prevent feedback loop
        if (voiceModeRecognitionRef.current) {
          try {
            voiceModeRecognitionRef.current.stop();
          } catch (e) {
            console.log('Recognition already stopped');
          }
        }
      };
      utterance.onend = () => {
        console.log('Speech ended');
        isSpeakingRef.current = false;
        setVoiceUiMode('listening'); // assistant-audio-end event
        // Resume listening after TOM finishes speaking
        if (isVoiceMode && voiceModeRecognitionRef.current) {
          setTimeout(() => {
            try {
              voiceModeRecognitionRef.current?.start();
            } catch (e) {
              console.log('Recognition already running');
            }
          }, 300);
        }
      };
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        isSpeakingRef.current = false;
        setVoiceUiMode('listening'); // assistant-audio-end event (error)
        // Resume listening after error
        if (isVoiceMode && voiceModeRecognitionRef.current) {
          setTimeout(() => {
            try {
              voiceModeRecognitionRef.current?.start();
            } catch (e) {}
          }, 300);
        }
      };

      console.log('Starting speech...');
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {showHeader && !isVoiceMode && (
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">TOM</h2>
        </div>
      )}

      {/* Immersive Voice Mode - Full Screen */}
      {isVoiceMode && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">

          {/* Centered Logo */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo with Animation */}
            <div className="relative">
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 blur-2xl transition-all duration-500 ${
                  isSpeaking ? 'opacity-80' : 'opacity-40'
                }`}
                style={{
                  animation: isSpeaking ? 'tomGlow 3s ease-in-out infinite' : 'none',
                  filter: isSpeaking ? 'hue-rotate(150deg)' : 'none'
                }}
              >
                <TomLogo
                  isListening={!isSpeaking}
                  isSpeaking={isSpeaking}
                  size={200}
                  variant="standalone"
                />
              </div>

              {/* Main Logo */}
              <div
                className="relative"
                style={{
                  animation: isSpeaking
                    ? 'tomGlow 3s ease-in-out infinite'
                    : inputMessage
                    ? 'tomJitter 0.8s ease-in-out infinite'
                    : 'none'
                }}
              >
                <TomLogo
                  isListening={!isSpeaking}
                  isSpeaking={isSpeaking}
                  size={200}
                  variant="standalone"
                />
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                voiceUiMode === 'speaking'
                  ? 'text-teal-600 dark:text-teal-400'
                  : voiceUiMode === 'thinking'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {voiceUiMode === 'speaking' ? 'TOM is speaking...' :
                 voiceUiMode === 'thinking' ? 'Thinking...' :
                 voiceUiMode === 'listening' ? 'Listening...' :
                 'Ready'}
              </p>

              {/* Live Transcript Preview */}
              {inputMessage && voiceUiMode === 'listening' && (
                <p className="text-sm text-gray-600 dark:text-slate-400 max-w-md px-4 italic">
                  "{inputMessage}"
                </p>
              )}
            </div>

            {/* Voice Visualization Bars */}
            {voiceUiMode !== 'thinking' && voiceUiMode !== 'idle' && (
              <div className="flex items-center gap-2 h-16">
                {[...Array(voiceUiMode === 'speaking' ? 7 : 5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-colors ${
                      voiceUiMode === 'speaking' ? 'bg-teal-500' : 'bg-blue-500'
                    }`}
                    style={{
                      height: '40px',
                      transformOrigin: 'center',
                      animation: voiceUiMode === 'speaking'
                        ? `tomBarsSpeaking ${0.4 + Math.random() * 0.3}s ease-in-out infinite`
                        : `tomBarsListening ${0.6 + Math.random() * 0.4}s ease-in-out infinite`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Exit Voice Mode Button */}
          <button
            onClick={handleVoiceMode}
            className="absolute bottom-8 bg-white/90 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">End Voice Mode</span>
          </button>
        </div>
      )}

      {/* Messages Area - Hidden in Voice Mode */}
      {!isVoiceMode && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'rounded-2xl px-4 py-2.5 bg-gray-500 dark:bg-slate-100 text-white dark:text-gray-900'
                  : ''
              }`}
            >
              <p className={`text-sm whitespace-pre-wrap ${message.role === 'assistant' ? 'text-gray-900 dark:text-slate-100' : ''}`}>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area - Fixed at bottom - Hidden in Voice Mode */}
      {!isVoiceMode && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Recording..." : isVoiceMode ? "Voice mode active..." : "Ask anything (press Enter)"}
              disabled={isVoiceMode}
              className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Mic Button - Recording/Dictation */}
              <button
                onClick={handleRecording}
                disabled={isVoiceMode}
                className={`p-2 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={isRecording ? 'Stop recording' : 'Record message'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Voice Mode Button - Conversational AI */}
              <button
                onClick={handleVoiceMode}
                disabled={isRecording}
                className={`p-2 rounded-full transition-all ${
                  isVoiceMode
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={isVoiceMode ? 'Stop voice mode' : 'Start voice conversation'}
              >
                {/* Waveform Icon - Like ChatGPT */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2m0 0v4m0-4V8m4 4h2m0 0v6m0-6V6m4 6h2m0 0v2m0-2v-2m4 2h2m0 0v4m0-4V8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isRecording && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></span>
              <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></span>
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
            </div>
            <p className="text-xs text-gray-600">Recording - Press Enter to send</p>
          </div>
        )}
        {isVoiceMode && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></span>
              <span className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
              <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></span>
              <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
            </div>
            <p className="text-xs text-blue-600">Voice mode - I'll respond when you pause</p>
          </div>
        )}
        {isSpeaking && (
          <div className="mt-3 flex items-center gap-2">
            <TomLogo isListening={false} isSpeaking={true} size={20} variant="inline" />
            <p className="text-xs text-teal-600">TOM is speaking...</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
