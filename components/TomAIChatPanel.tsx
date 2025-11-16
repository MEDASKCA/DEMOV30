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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceModeRecognitionRef = useRef<any>(null);

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
        if (isVoiceMode) {
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
    if (!voiceModeRecognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isVoiceMode) {
      voiceModeRecognitionRef.current.stop();
      setIsVoiceMode(false);
      setInputMessage('');
    } else {
      voiceModeRecognitionRef.current.start();
      setIsVoiceMode(true);
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
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
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
      {showHeader && (
        <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 via-teal-50 to-purple-50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 bg-clip-text text-transparent">TOM</h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">Your Theatre Operations Assistant</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
    </div>
  );
}
