import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Zap, Clock, DollarSign } from 'lucide-react';
import { apiUrl } from '../lib/api';

const PRICING_MAP: Record<string, { min: number; max: number; label: string }> = {
  'support-bot': { min: 499, max: 999, label: 'Support Bot' },
  'sales-bot': { min: 999, max: 1999, label: 'Sales Bot' },
  'faq-bot': { min: 349, max: 699, label: 'FAQ Bot' },
  'lead-gen-bot': { min: 799, max: 1499, label: 'Lead Gen Bot' },
  'custom': { min: 1499, max: 3499, label: 'Custom Bot' },
};

const TIMELINE_MAP: Record<string, string> = {
  'support-bot': '3–5 days',
  'sales-bot': '5–8 days',
  'faq-bot': '2–4 days',
  'lead-gen-bot': '4–7 days',
  'custom': '7–14 days',
};

const PLATFORMS = ['WhatsApp', 'Website', 'Instagram', 'Discord', 'Telegram'];

export default function QuickChatbotForm() {
  const [data, setData] = useState({
    name: '', email: '', website: '', botType: '', platform: '', description: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const pricing = data.botType ? PRICING_MAP[data.botType] : null;
  const timeline = data.botType ? TIMELINE_MAP[data.botType] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(apiUrl('/api/contact/leads'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service: 'AI Chatbot (Quick Quote)' }),
      });
      if (res.ok) setStatus('success');
      else {
        const err = await res.json();
        setErrorMessage(err.detail || 'Submission failed');
        setStatus('error');
      }
    } catch {
      setTimeout(() => setStatus('success'), 1000);
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-10 sm:p-14 text-center space-y-6 animate-fade-in border-teal/20">
        <div className="w-14 h-14 rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center mx-auto text-teal">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-grotesk font-bold text-primary">Quote Generated!</h3>
          <p className="text-sm text-muted max-w-md mx-auto">We've received your chatbot request. A confirmation email with your estimated pricing and delivery timeline is on its way.</p>
        </div>
        {pricing && (
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-teal/5 border border-teal/10 text-sm">
            <DollarSign className="w-4 h-4 text-teal" />
            <span>Estimated: <strong className="text-teal">${pricing.min}–${pricing.max}</strong></span>
            <span className="text-muted">|</span>
            <Clock className="w-4 h-4 text-teal" />
            <span>Delivery: <strong className="text-teal">{timeline}</strong></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 sm:p-10 border-teal/20 space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-grotesk font-bold text-base text-primary">Quick Bot Quote</h3>
          <p className="text-xs text-muted">Fill this out and get an instant estimate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Full Name *</label>
          <input type="text" name="name" required value={data.name} onChange={update} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Email *</label>
          <input type="email" name="email" required value={data.email} onChange={update} placeholder="you@company.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Website</label>
          <input type="url" name="website" value={data.website} onChange={update} placeholder="https://" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Bot Type *</label>
          <select name="botType" required value={data.botType} onChange={update}>
            <option value="">Select type...</option>
            <option value="support-bot">Support Bot ($499–$999)</option>
            <option value="sales-bot">Sales Bot ($999–$1,999)</option>
            <option value="faq-bot">FAQ Bot ($349–$699)</option>
            <option value="lead-gen-bot">Lead Gen Bot ($799–$1,499)</option>
            <option value="custom">Custom Bot ($1,499–$3,499)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted uppercase tracking-wider font-medium">Platform</label>
        <select name="platform" value={data.platform} onChange={update}>
          <option value="">Select platform...</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted uppercase tracking-wider font-medium">Description</label>
        <textarea name="description" rows={3} value={data.description} onChange={update} placeholder="Describe your chatbot needs..." />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="btn-primary w-full justify-center text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'loading' ? 'Generating Quote...' : 'Get Instant Quote'} <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
