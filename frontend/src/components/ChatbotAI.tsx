import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Phone, Mail, Calendar, Check } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type?: 'text' | 'lead_form' | 'booking' | 'handoff';
}

interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  business_type: string;
  budget_range: string;
  requirements: string;
}

const suggestions = [
  'How can AI automate my business?',
  'What are your chatbot options?',
  'Tell me about your pricing',
  'Book a discovery call',
];

export default function ChatbotAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hey! I'm Aryan, founder of AryanForge. I help businesses automate and scale with AI. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({
    name: '', email: '', phone: '', business_type: '', budget_range: '', requirements: '',
  });
  const [leadScore, setLeadScore] = useState<number | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [suggestedAction, setSuggestedAction] = useState<string>('none');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpSent, setFollowUpSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = localStorage.getItem('ai_session_id');
    if (stored) setSessionId(stored);
    else {
      const newId = crypto.randomUUID();
      setSessionId(newId);
      localStorage.setItem('ai_session_id', newId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl('/api/ai/chat-enhanced'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          name: leadInfo.name || undefined,
          email: leadInfo.email || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date() }]);
        if (data.session_id) {
          setSessionId(data.session_id);
          localStorage.setItem('ai_session_id', data.session_id);
        }
        if (data.lead_captured) setLeadCaptured(true);
        if (data.lead_score !== null && data.lead_score !== undefined) setLeadScore(data.lead_score);
        if (data.lead_status) setLeadStatus(data.lead_status);
        if (data.suggested_action) setSuggestedAction(data.suggested_action);
        if (data.wants_human) {
          setMessages((prev) => [...prev, {
            sender: 'bot',
            text: "Would you like me to connect you directly with Aryan? He'll reach out to you personally.",
            timestamp: new Date(),
            type: 'handoff',
          }]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: errorData.detail || "I'm running in offline mode. Let me connect you with our team instead. What's the best way to reach you?",
          timestamp: new Date(),
        }]);
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: "I'm in offline demo mode right now. Want to leave your contact info so Aryan can reach out personally?",
        timestamp: new Date(),
      }]);
      setShowLeadForm(true);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, isTyping, leadInfo]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) sendMessage(input);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.name || !leadInfo.email) return;

    try {
      await fetch(apiUrl('/api/ai/lead-info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, ...leadInfo }),
      });
    } catch { /* offline */ }

    setLeadCaptured(true);
    setShowLeadForm(false);
    setMessages((prev) => [...prev, {
      sender: 'bot',
      text: `Thanks ${leadInfo.name}! I've saved your info. Let me know if you'd like to book a quick discovery call with me, or ask more questions about our services.`,
      timestamp: new Date(),
    }]);
  };

  const handleBookCall = async () => {
    const name = leadInfo.name || 'there';
    try {
      const response = await fetch(apiUrl('/api/ai/book-call'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: sessionId,
          name: leadInfo.name || 'Website Visitor',
          email: leadInfo.email || 'unknown@visitor.com',
        }),
      });
      const data = await response.json();
      if (data.meeting_link) {
        window.open(data.meeting_link, '_blank');
      }
    } catch { /* offline */ }

    setMessages((prev) => [...prev, {
      sender: 'bot',
      text: `Great choice, ${name}! I've opened the Calendly link for you. Pick a time that works best — looking forward to our chat!`,
      timestamp: new Date(),
      type: 'booking',
    }]);
    setSuggestedAction('none');
  };

  const handleHandoff = async () => {
    try {
      await fetch(apiUrl('/api/ai/handoff'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch { /* offline */ }

    setMessages((prev) => [...prev, {
      sender: 'bot',
      text: "Perfect! I've notified Aryan. He'll personally reach out to you via email within the next few hours. In the meantime, feel free to ask me anything else!",
      timestamp: new Date(),
    }]);
  };

  const handleFollowUp = async () => {
    if (!leadInfo.email) {
      setShowLeadForm(true);
      return;
    }
    setShowFollowUp(false);
    setFollowUpSent(true);
    try {
      await fetch(apiUrl('/api/ai/follow-up'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: sessionId,
          email: leadInfo.email,
          name: leadInfo.name,
        }),
      });
    } catch { /* offline */ }

    setMessages((prev) => [...prev, {
      sender: 'bot',
      text: `I've sent a follow-up to your email (${leadInfo.email}) with more details and a link to book a free discovery call. Talk soon!`,
      timestamp: new Date(),
    }]);
  };

  const handleClose = () => {
    if (!leadCaptured && messages.length > 2) {
      setShowFollowUp(true);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-darkbg shadow-lg hover:shadow-xl hover:shadow-gold/20 hover:scale-105 transition-all duration-200 cursor-pointer min-h-[48px] min-w-[48px]"
          aria-label="Ask Aryan AI Assistant"
        >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] h-[520px] max-h-[calc(100vh-120px)] card rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-default flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h4 className="font-grotesk font-semibold text-sm text-primary">Aryan AI Consultant</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted">Online — Founder @ AryanForge</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {leadStatus && (
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  leadStatus === 'hot' ? 'bg-red-500/20 text-red-400' :
                  leadStatus === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                  leadStatus === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {leadStatus}
                </span>
              )}
              <button onClick={handleClose} className="text-muted hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 max-w-[92%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-gold text-darkbg' : 'bg-raised text-gold border border-default'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gold text-darkbg rounded-tr-none'
                    : 'bg-raised border border-default text-secondary rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            {suggestedAction === 'book_call' && !messages.some(m => m.type === 'booking') && (
              <div className="flex gap-2 pt-1">
                <button onClick={handleBookCall}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold text-darkbg text-xs font-medium hover:bg-gold-dim transition-all cursor-pointer">
                  <Calendar className="w-3.5 h-3.5" />
                  Book Free Call
                </button>
                <button onClick={() => setSuggestedAction('none')}
                  className="px-3 py-2 rounded-xl border border-default text-muted text-xs hover:text-primary transition-all cursor-pointer">
                  Not now
                </button>
              </div>
            )}

            {messages.some(m => m.type === 'handoff') && !messages.some(m => m.type === 'handoff' && m.sender === 'bot' && m.text.includes('notified')) && (
              <div className="flex gap-2 pt-1">
                <button onClick={handleHandoff}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/20 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/30 transition-all cursor-pointer">
                  <Phone className="w-3.5 h-3.5" />
                  Connect with Aryan
                </button>
              </div>
            )}

            {/* Lead Form */}
            {showLeadForm && !leadCaptured && (
              <div className="bg-raised border border-default rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  Leave your info — Aryan will reach out:
                </p>
                <form onSubmit={handleLeadSubmit} className="space-y-2">
                  <input type="text" placeholder="Your name *" value={leadInfo.name}
                    onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default" required />
                  <input type="email" placeholder="Your email *" value={leadInfo.email}
                    onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default" required />
                  <input type="text" placeholder="Phone (optional)" value={leadInfo.phone}
                    onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default" />
                  <input type="text" placeholder="Business type (optional)" value={leadInfo.business_type}
                    onChange={(e) => setLeadInfo({ ...leadInfo, business_type: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default" />
                  <select value={leadInfo.budget_range}
                    onChange={(e) => setLeadInfo({ ...leadInfo, budget_range: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default text-muted">
                    <option value="">Budget range...</option>
                    <option value="under-5k">Under $5,000</option>
                    <option value="5k-15k">$5,000 - $15,000</option>
                    <option value="15k-50k">$15,000 - $50,000</option>
                    <option value="50k-plus">$50,000+</option>
                  </select>
                  <textarea placeholder="Briefly describe your project..." value={leadInfo.requirements}
                    onChange={(e) => setLeadInfo({ ...leadInfo, requirements: e.target.value })}
                    className="w-full text-xs py-1.5 px-3 rounded-lg bg-theme-primary border border-default resize-none h-16" />
                  <button type="submit"
                    className="w-full py-2 rounded-xl bg-gold text-darkbg text-xs font-medium hover:bg-gold-dim transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Send & Continue
                  </button>
                </form>
              </div>
            )}

            {/* Typing Indicator */}
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

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {suggestions.map((sug, i) => (
                <button key={i} onClick={() => sendMessage(sug)}
                  className="text-[11px] text-secondary hover:text-primary bg-raised hover:bg-hovered border border-default px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer">
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Score Badge */}
          {leadScore !== null && leadScore > 0 && (
            <div className="px-4 pb-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    leadScore >= 70 ? 'bg-green-500' : leadScore >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} style={{ width: `${leadScore}%` }} />
                </div>
                <span className="text-[9px] text-muted font-medium">Score: {leadScore}/100</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3.5 border-t border-default shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 py-2 text-sm"
                disabled={isTyping}
              />
              <button onClick={() => sendMessage(input)}
                disabled={isTyping || !input.trim()}
                className="p-2.5 rounded-xl bg-gold hover:bg-gold-dim text-darkbg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUp && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 space-y-4 rounded-2xl">
            <h4 className="font-grotesk font-bold text-primary text-sm">Don't lose your conversation!</h4>
            <p className="text-xs text-muted">Want us to follow up via email so we can continue where we left off?</p>
            <div className="flex gap-2">
              <button onClick={handleFollowUp}
                className="flex-1 py-2 rounded-xl bg-gold text-darkbg text-xs font-medium hover:bg-gold-dim transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Send Follow-up
              </button>
              <button onClick={() => { setShowFollowUp(false); setIsOpen(false); }}
                className="flex-1 py-2 rounded-xl border border-default text-muted text-xs hover:text-primary transition-all cursor-pointer">
                No thanks
              </button>
            </div>
            {followUpSent && (
              <p className="text-[10px] text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Follow-up sent to your email!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
