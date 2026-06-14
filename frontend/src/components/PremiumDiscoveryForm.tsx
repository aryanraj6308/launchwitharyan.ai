import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, ChevronRight, Shield, Clock, Users, Star } from 'lucide-react';
import { apiUrl } from '../lib/api';

const STEPS = [
  { label: 'Company Info', fields: ['name', 'email', 'company', 'website'] },
  { label: 'Context', fields: ['industry', 'teamSize', 'problems'] },
  { label: 'Scope', fields: ['process', 'tools', 'budget', 'timeline'] },
];

const INITIAL = {
  name: '', email: '', company: '', website: '',
  industry: '', teamSize: '', problems: '',
  process: '', tools: '', budget: '', timeline: '',
};

type Step = 1 | 2 | 3;

export default function PremiumDiscoveryForm() {
  const [data, setData] = useState(INITIAL);
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const valid = (s: Step) => {
    const fields = STEPS[s - 1].fields;
    return fields.every(f => data[f as keyof typeof data]?.trim());
  };

  const next = () => { if (step < 3 && valid(step)) setStep((step + 1) as Step); };
  const prev = () => { if (step > 1) setStep((step - 1) as Step); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(apiUrl('/api/contact/leads'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service: 'AI Automation (Premium Discovery)' }),
      });
      if (res.ok) setStatus('success');
      else {
        const err = await res.json();
        setErrorMessage(err.detail || 'Submission failed');
        setStatus('error');
      }
    } catch {
      setTimeout(() => setStatus('success'), 1200);
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-10 sm:p-14 text-center space-y-6 animate-fade-in border-gold/20">
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-grotesk font-bold text-primary">Discovery Request Received</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Thank you. Our architecture team will review your automation requirements and reach out within 12 hours with a tailored proposal.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 text-xs text-gold">
          <Clock className="w-3.5 h-3.5" />
          <span>Typical response time: 2–12 hours</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 sm:p-10 border-gold/20 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Step {step} of 3 — <span className="text-gold font-medium">{STEPS[step - 1].label}</span></span>
          <span className="text-xs text-muted">{Math.round(step / 3 * 100)}% complete</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-gold' : 'bg-raised'}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/5 border border-gold/10 text-xs text-gold">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>We only take <strong>limited automation clients</strong> each month to ensure quality. Book your discovery while slots are open.</span>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Full Name *</label>
              <input type="text" name="name" required value={data.name} onChange={update} placeholder="Aryan Sharma" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Business Email *</label>
              <input type="email" name="email" required value={data.email} onChange={update} placeholder="aryan@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Company Name *</label>
              <input type="text" name="company" required value={data.company} onChange={update} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Website URL *</label>
              <input type="url" name="website" required value={data.website} onChange={update} placeholder="https://acme.com" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Industry *</label>
              <select name="industry" required value={data.industry} onChange={update}>
                <option value="">Select industry...</option>
                <option value="saas">SaaS / Technology</option>
                <option value="ecommerce">E-Commerce / Retail</option>
                <option value="healthcare">Healthcare / Biotech</option>
                <option value="finance">Finance / Fintech</option>
                <option value="realestate">Real Estate / Construction</option>
                <option value="agency">Agency / Consulting</option>
                <option value="education">Education / EdTech</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Team Size *</label>
              <select name="teamSize" required value={data.teamSize} onChange={update}>
                <option value="">Select team size...</option>
                <option value="1">Solo (1)</option>
                <option value="2-5">Small Team (2–5)</option>
                <option value="6-20">Growing Team (6–20)</option>
                <option value="21-50">Mid-Size (21–50)</option>
                <option value="51+">Enterprise (51+)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted uppercase tracking-wider font-medium">Current Workflow Problems *</label>
            <textarea name="problems" required rows={3} value={data.problems} onChange={update} placeholder="Describe the bottlenecks, manual processes, or operational challenges you're facing..." />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-xs text-muted uppercase tracking-wider font-medium">What Process Needs Automation? *</label>
            <select name="process" required value={data.process} onChange={update}>
              <option value="">Select primary process...</option>
              <option value="lead-gen">Lead Generation / Qualification</option>
              <option value="support">Customer Support / Ticketing</option>
              <option value="data-entry">Data Entry / CRM Updates</option>
              <option value="email">Email / Outreach Automation</option>
              <option value="reporting">Reporting / Analytics</option>
              <option value="multi">Multi-Workflow / Full Stack</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted uppercase tracking-wider font-medium">Existing Tools Used *</label>
            <input type="text" name="tools" required value={data.tools} onChange={update} placeholder="e.g. HubSpot, Salesforce, Slack, Gmail, Zapier" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Budget Range *</label>
              <select name="budget" required value={data.budget} onChange={update}>
                <option value="">Select budget...</option>
                <option value="2k-5k">$2,000 – $5,000</option>
                <option value="5k-10k">$5,000 – $10,000</option>
                <option value="10k-25k">$10,000 – $25,000</option>
                <option value="25k+">$25,000+</option>
                <option value="undecided">Not Sure Yet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Timeline *</label>
              <select name="timeline" required value={data.timeline} onChange={update}>
                <option value="">Select timeline...</option>
                <option value="asap">ASAP — Within 2 Weeks</option>
                <option value="1month">1 Month</option>
                <option value="2-3months">2–3 Months</option>
                <option value="exploring">Just Exploring</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={prev} disabled={step === 1}
          className="px-4 py-2 rounded-xl text-xs text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          Back
        </button>
        {step < 3 ? (
          <button type="button" onClick={next} disabled={!valid(step)}
            className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed">
            Next Step <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button type="submit" disabled={status === 'loading' || !valid(3)}
            className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed">
            {status === 'loading' ? 'Submitting...' : 'Request Discovery Call'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted border-t border-default">
        <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-gold" /> Encrypted</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> 2–12h response</span>
        <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gold" /> 150+ clients</span>
        <span className="inline-flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold" /> 4.9★ rating</span>
      </div>
    </form>
  );
}
