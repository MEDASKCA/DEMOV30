'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      let accumulatedText = '';

      recognitionRef.current.onresult = (event: any) => {
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

        // Collect all transcripts
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Accumulate final text
        if (finalTranscript) {
          accumulatedText += finalTranscript;
        }

        // Show current text (accumulated + interim)
        const currentText = (accumulatedText + interimTranscript).trim();
        setInputMessage(currentText);

        // Auto-send after 1.5 seconds of silence (when final transcript detected)
        if (finalTranscript.trim()) {
          console.log('Detected speech, will auto-send in 1.5s...');
          autoSendTimeout = setTimeout(() => {
            const textToSend = accumulatedText.trim();
            console.log('Auto-sending:', textToSend);
            if (textToSend) {
              // Reset accumulated text
              accumulatedText = '';
              // Send the message (handleSendMessage reads from inputMessage state)
              handleSendMessage();
            }
          }, 1500); // Wait 1.5 seconds after user stops talking
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
        // Use RAG-enabled endpoint with database access
        const { TomAIService } = await import('@/lib/tomAIService');
        const result = await TomAIService.processQuery(query);

        setMessages(prev => prev.map(m =>
          m.id === streamingMessageId
            ? { ...m, content: result.message }
            : m
        ));

        // Speak the response
        if ('speechSynthesis' in window && result.message) {
          speakMessage(result.message);
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

    // Try Azure TTS first for realistic voice
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'onyx' // Deep, professional male voice (ChatGPT-like)
        })
      });

      if (response.ok && response.headers.get('Content-Type')?.includes('audio')) {
        // Play the Azure TTS audio
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.play().catch(error => {
          console.log('Audio playback failed, using browser fallback:', error);
          speakWithBrowserVoice(text);
        });

        // Clean up URL after playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
        };

        return; // Successfully using Azure TTS
      }
    } catch (error) {
      console.log('Azure TTS not available, using browser fallback');
    }

    // Fallback to browser speech synthesis
    speakWithBrowserVoice(text);
  };

  const speakWithBrowserVoice = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.log('Browser speech synthesis not available');
      return;
    }

    console.log('Using browser voice fallback');

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      console.log('Available voices:', voices.length);

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
        console.log('Selected voice:', selectedVoice.name);

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
        console.log('No specific voice found, using default en-GB');
      }

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
        <div className="flex gap-2 items-end">
          <button
            onClick={handleVoiceInput}
            className="p-2 rounded-full transition-all flex-shrink-0 hover:scale-105"
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <TomLogo
              isListening={isListening}
              isSpeaking={isSpeaking}
              size={48}
              variant="inline"
            />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message TOM..."
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
          <div className="mt-2 space-y-1">
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span className="animate-pulse">●</span> Listening... (Speak naturally, I'll auto-send when you stop)
            </p>
            <p className="text-xs text-gray-500 italic">
              Tip: Wait 1.5 seconds after speaking for auto-send, or click Send button
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
