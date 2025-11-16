'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, MicOff } from 'lucide-react';
import { useListening } from '@/contexts/ListeningContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TomAIView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "TOM: Hello Alexander! How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('Available voices:', voices.map(v => v.name));
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

  // Initialize Speech Recognition with continuous listening and wake word
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;  // Keep listening
      recognitionRef.current.interimResults = true;  // Show interim results
      recognitionRef.current.lang = 'en-GB';

      let autoSendTimeout: NodeJS.Timeout | null = null;

      recognitionRef.current.onresult = (event: any) => {
        // Stop any ongoing speech when user starts talking (interrupt)
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // Clear any pending auto-send
        if (autoSendTimeout) {
          clearTimeout(autoSendTimeout);
          autoSendTimeout = null;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Check for wake word "Hey TOM"
        const combined = (finalTranscript + interimTranscript).toLowerCase();
        if (combined.includes('hey tom') || combined.includes('hey time') || combined.includes('a tom')) {
          // Remove wake word and start listening for command
          const query = combined.replace(/hey tom|hey time|a tom/gi, '').trim();
          if (query) {
            setInputMessage(query);
            // Auto-send immediately after detecting wake word
            autoSendTimeout = setTimeout(() => {
              handleSendMessage();
              setInputMessage('');
            }, 300);
          }
          return;
        }

        // Update input with final or interim transcript
        if (finalTranscript) {
          setInputMessage(finalTranscript);
          // Auto-send when speech is finalized (reduced delay for faster response)
          autoSendTimeout = setTimeout(() => {
            if (finalTranscript.trim()) {
              handleSendMessage();
              setInputMessage('');
            }
          }, 500);
        } else if (interimTranscript) {
          setInputMessage(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          if (isListening) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                // Already started
              }
            }, 100);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still in listening mode
        if (isListening) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Already started
          }
        }
      };
    }
  }, [isListening]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
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

      // Show typing indicator
      const typingMessage: Message = {
        id: 'typing',
        role: 'assistant',
        content: '...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, typingMessage]);

      // Process query with TOM AI Service
      try {
        const { TomAIService } = await import('@/lib/tomAIService');
        const result = await TomAIService.processQuery(query);

        // Remove typing indicator and add real response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'typing');
          return [
            ...filtered,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: result.message,
              timestamp: new Date()
            }
          ];
        });

        // If voice output is available, speak the response with natural young male voice
        if ('speechSynthesis' in window && result.success && voicesLoaded) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();

          // Small delay to ensure voices are fully loaded
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(result.message);

            // Get all available voices
            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

            // Try to find a male voice - be very aggressive in searching
            let selectedVoice = null;

            // Priority list of male voices (most natural first)
            const preferredMaleVoices = [
              'Google UK English Male',
              'Microsoft David - English (United Kingdom)',
              'Daniel (Enhanced)',
              'Daniel',
              'Google US English',
              'Microsoft Mark - English (United States)'
            ];

            // First: Look for preferred voices
            for (const prefName of preferredMaleVoices) {
              selectedVoice = voices.find(v => v.name === prefName);
              if (selectedVoice) break;
            }

            // Second: Look for any voice with "male" in the name
            if (!selectedVoice) {
              selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en') &&
                voice.name.toLowerCase().includes('male')
              );
            }

            // Third: Look for known male voice names
            if (!selectedVoice) {
              const maleVoiceNames = ['daniel', 'david', 'mark', 'alex', 'james', 'thomas', 'ryan', 'aaron'];
              selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en') &&
                maleVoiceNames.some(name => voice.name.toLowerCase().includes(name))
              );
            }

            // Fourth: On Windows, look for Microsoft voices that aren't female
            if (!selectedVoice) {
              selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en') &&
                voice.name.includes('Microsoft') &&
                !voice.name.includes('Zira') &&
                !voice.name.includes('Susan') &&
                !voice.name.includes('Linda') &&
                !voice.name.includes('Hazel')
              );
            }

            // Fifth: Try Google voices (usually better quality)
            if (!selectedVoice) {
              selectedVoice = voices.find(voice =>
                voice.name.includes('Google') &&
                voice.lang.startsWith('en')
              );
            }

            // Configure voice parameters for natural male sound
            if (selectedVoice) {
              utterance.voice = selectedVoice;
              utterance.lang = selectedVoice.lang;
              console.log('✓ Selected voice:', selectedVoice.name, selectedVoice.lang);

              // Adjust based on voice type
              if (selectedVoice.name.includes('Google')) {
                utterance.rate = 1.0;
                utterance.pitch = 0.9;
              } else if (selectedVoice.name.includes('Microsoft')) {
                utterance.rate = 1.05;
                utterance.pitch = 0.85;
              } else {
                utterance.rate = 1.1;
                utterance.pitch = 0.9;
              }
            } else {
              utterance.lang = 'en-GB';
              utterance.rate = 1.05;
              utterance.pitch = 0.85;
              console.log('⚠ No male voice found, using default with adjusted pitch');
            }

            utterance.volume = 1.0;

            window.speechSynthesis.speak(utterance);
          }, 100);
        }
      } catch (error) {
        // Remove typing indicator and show error
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'typing');
          return [
            ...filtered,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'I encountered an error processing your request. Please try again.',
              timestamp: new Date()
            }
          ];
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Messages Area - Takes full height with centered layout */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-3 md:px-4 py-6 md:py-8 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom of container */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-3xl mx-auto w-full px-3 md:px-4 py-3 md:py-4">
          <div className="flex gap-2 items-center w-full">
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 md:p-3 rounded-lg transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message TOM..."
              className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2.5 md:p-3 bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {isListening && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <span className="animate-pulse">●</span> Listening...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
