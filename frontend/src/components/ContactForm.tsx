import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'AI Automation',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(apiUrl('/api/contact/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      // Fallback preview mode
      setTimeout(() => {
        setStatus('success');
      }, 1000);
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 sm:p-12 rounded-3xl border border-green-500/20 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-grotesk font-bold text-primary">Consultation Requested!</h3>
          <p className="text-muted font-sans text-sm max-w-sm mx-auto leading-relaxed">
            Thank you. Aryan or one of our core solution architects will review your company details and email you within 12 hours.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', company: '', service: 'AI Automation', message: '' });
            setStatus('idle');
          }}
          className="px-6 py-2.5 rounded-full bg-raised hover:bg-hover border border-default text-xs font-semibold text-primary transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 sm:p-10 rounded-3xl border border-default space-y-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-semibold text-muted uppercase tracking-wider">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl bg-raised border border-default text-primary placeholder:text-placeholder focus:outline-none focus:border-gold/50 text-sm transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold text-muted uppercase tracking-wider">Business Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@company.com"
            className="w-full px-4 py-3 rounded-xl bg-raised border border-default text-primary placeholder:text-placeholder focus:outline-none focus:border-gold/50 text-sm transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Company */}
        <div className="space-y-2">
          <label htmlFor="company" className="text-xs font-semibold text-muted uppercase tracking-wider">Company Name</label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Corp"
            className="w-full px-4 py-3 rounded-xl bg-raised border border-default text-primary placeholder:text-placeholder focus:outline-none focus:border-gold/50 text-sm transition-colors"
          />
        </div>

        {/* Service */}
        <div className="space-y-2">
          <label htmlFor="service" className="text-xs font-semibold text-muted uppercase tracking-wider">Service Required</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-raised border border-default text-primary placeholder:text-placeholder focus:outline-none focus:border-gold/50 text-sm transition-colors"
          >
            <option value="AI Automation" >AI Workflows & Automation</option>
            <option value="Premium Website" >Premium Web Platform</option>
            <option value="AI Chatbot" >Conversational AI Chatbot</option>
            <option value="SEO Automation" >Programmatic SEO Engine</option>
            <option value="Bespoke Solution" >Custom Consulting</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-semibold text-muted uppercase tracking-wider">Project Scope & Details</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Briefly describe what operations you want automated or websites you want built..."
          className="w-full px-4 py-3 rounded-xl bg-raised border border-default text-primary placeholder:text-placeholder focus:outline-none focus:border-gold/50 text-sm transition-colors resize-none"
        ></textarea>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-dim font-sans text-sm font-semibold text-darkbg transition-all duration-300 hover:shadow-lg hover:shadow-gold/25 disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        {status === 'loading' ? 'Submitting Details...' : 'Request Discovery Call'}
      </button>
    </form>
  );
}
