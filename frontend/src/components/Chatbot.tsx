import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const suggestions = [
  'How can AI automate my business?',
  'What premium web templates do you sell?',
  'Custom AI chatbot pricing?',
  'Tell me about your RAG solutions.'
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Welcome to LaunchWithAryan AI. I'm your interactive intelligence consultant. How can we optimize your digital business workflows today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Send request to FastAPI backend
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: Message = {
          sender: 'bot',
          text: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Fallback mock response in case the backend is offline
        setTimeout(() => {
          const mockBotMsg: Message = {
            sender: 'bot',
            text: `[Offline Demo Mode] I received: "${text}". To link this assistant to our OpenAI or local Ollama configurations, spin up the FastAPI service on port 8000!`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, mockBotMsg]);
          setIsTyping(false);
        }, 1200);
        return;
      }
    } catch (err) {
      // Fallback mock response in case of network errors
      setTimeout(() => {
        const mockBotMsg: Message = {
          sender: 'bot',
          text: `[Offline Demo Mode] I'm ready to guide you. When our FastAPI server is online on port 8000, I will talk to local Ollama or OpenAI. Let me know what automation questions you have!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, mockBotMsg]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-teal flex items-center justify-center text-theme-primary shadow-xl shadow-primary/30 hover:scale-105 transition-transform duration-300 cursor-pointer"
        aria-label="Ask Aryan AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[350px] sm:w-[400px] h-[500px] glassmorphism rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-subtle animate-fade-in animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 border-b border-subtle bg-elevated flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-grotesk font-semibold text-theme-primary text-sm">Aryan AI Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-theme-muted">Ready to consult</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-theme-muted hover:text-theme-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-theme-primary'
                      : 'bg-hover text-gold border border-subtle'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-theme-primary rounded-tr-none'
                      : 'bg-elevated border border-subtle text-theme-secondary rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-hover text-gold border border-subtle flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-elevated border border-subtle text-theme-muted rounded-tl-none text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-theme-muted rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-theme-muted rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-theme-muted rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(sug)}
                  className="text-[11px] text-theme-secondary hover:text-theme-primary bg-elevated hover:bg-hover border border-subtle hover:border-subtle px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-4 border-t border-subtle bg-elevated">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-elevated border border-subtle text-theme-primary placeholder:text-placeholder focus:outline-none focus:border-primary/50 text-sm transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-theme-primary flex items-center justify-center transition-all duration-300 cursor-pointer"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
