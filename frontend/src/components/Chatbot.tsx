import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { apiUrl } from '../lib/api';

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
      text: "Welcome! I'm your interactive intelligence consultant. How can we optimize your digital business workflows today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date() }]);
        setIsTyping(false);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, { sender: 'bot', text: `[Offline Demo Mode] I received: "${text}". To link this assistant to our OpenAI or local Ollama configurations, spin up the FastAPI service on port 8000!`, timestamp: new Date() }]);
          setIsTyping(false);
        }, 1200);
      }
    } catch {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: `[Offline Demo Mode] I'm ready to guide you. When our FastAPI server is online on port 8000, I will talk to local Ollama or OpenAI. Let me know what automation questions you have!`, timestamp: new Date() }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-darkbg shadow-lg hover:shadow-xl hover:shadow-gold/20 hover:scale-105 transition-all duration-200 cursor-pointer"
        aria-label="Ask Aryan AI Assistant"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 w-[340px] sm:w-[380px] h-[480px] card rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
          <div className="px-4 py-3.5 border-b border-default flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h4 className="font-grotesk font-semibold text-sm text-primary">Aryan AI Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted">Ready to consult</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-gold text-darkbg' : 'bg-raised text-gold border border-default'}`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-gold text-darkbg rounded-tr-none' : 'bg-raised border border-default text-secondary rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[88%]">
                <div className="w-6 h-6 rounded-full bg-raised text-gold border border-default flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="rounded-xl px-3.5 py-2.5 bg-raised border border-default text-muted rounded-tl-none text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button key={i} onClick={() => sendMessage(sug)}
                  className="text-[11px] text-secondary hover:text-primary bg-raised hover:bg-hovered border border-default px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer">
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="p-3.5 border-t border-default">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 py-2 text-sm"
              />
              <button onClick={() => sendMessage(input)}
                className="p-2 rounded-xl bg-gold hover:bg-gold-dim text-darkbg transition-all duration-200 cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
