'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

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
      content: "Hello Alexander! How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-GB';

      let autoSendTimeout: NodeJS.Timeout | null = null;

      recognitionRef.current.onresult = (event: any) => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

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

        const combined = (finalTranscript + interimTranscript).toLowerCase();
        if (combined.includes('hey tom') || combined.includes('hey time') || combined.includes('a tom')) {
          const query = combined.replace(/hey tom|hey time|a tom/gi, '').trim();
          if (query) {
            setInputMessage(query);
            autoSendTimeout = setTimeout(() => {
              handleSendMessage();
              setInputMessage('');
            }, 300);
          }
          return;
        }

        if (finalTranscript) {
          setInputMessage(finalTranscript);
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
        if (event.error === 'no-speech' && isListening) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
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

      const typingMessage: Message = {
        id: 'typing',
        role: 'assistant',
        content: '...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, typingMessage]);

      try {
        const { TomAIService } = await import('@/lib/tomAIService');
        const result = await TomAIService.processQuery(query);

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

        if ('speechSynthesis' in window && result.success && voicesLoaded) {
          window.speechSynthesis.cancel();

          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(result.message);
            const voices = window.speechSynthesis.getVoices();

            let selectedVoice = null;
            const preferredMaleVoices = [
              'Google UK English Male',
              'Microsoft David - English (United Kingdom)',
              'Daniel (Enhanced)',
              'Daniel',
              'Google US English',
              'Microsoft Mark - English (United States)'
            ];

            for (const prefName of preferredMaleVoices) {
              selectedVoice = voices.find(v => v.name === prefName);
              if (selectedVoice) break;
            }

            if (!selectedVoice) {
              selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en') &&
                voice.name.toLowerCase().includes('male')
              );
            }

            if (!selectedVoice) {
              const maleVoiceNames = ['daniel', 'david', 'mark', 'alex', 'james', 'thomas', 'ryan', 'aaron'];
              selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en') &&
                maleVoiceNames.some(name => voice.name.toLowerCase().includes(name))
              );
            }

            if (selectedVoice) {
              utterance.voice = selectedVoice;
              utterance.lang = selectedVoice.lang;

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
            }

            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
          }, 100);
        }
      } catch (error) {
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
      {showHeader && (
        <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 via-teal-50 to-purple-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 bg-clip-text text-transparent">TOM AI</h2>
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
        <div className="flex gap-2 items-end">
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-lg transition-all flex-shrink-0 ${
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
            placeholder="Message TOM AI..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
  );
}
