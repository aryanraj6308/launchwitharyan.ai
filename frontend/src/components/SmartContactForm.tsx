import React, { useState, useEffect } from 'react';
import PremiumDiscoveryForm from './PremiumDiscoveryForm.tsx';
import QuickChatbotForm from './QuickChatbotForm.tsx';

type FormType = 'premium' | 'quick' | null;

export default function SmartContactForm() {
  const [formType, setFormType] = useState<FormType>(null);
  const [manualType, setManualType] = useState<string>('');
  const [showSelector, setShowSelector] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const service = params.get('service');
    const source = params.get('source');

    if (type === 'premium' || source === 'growth' || source === 'enterprise') {
      setFormType('premium');
      setShowSelector(false);
    } else if (type === 'quick' || source === 'starter') {
      setFormType('quick');
      setShowSelector(false);
    }
  }, []);

  const handleManualSelect = () => {
    const automations = ['ai-automation', 'business-automation', 'custom-ai', 'enterprise-automation'];
    const chatbots = ['chatbot', 'website-bot', 'faq-bot', 'lead-bot'];

    if (automations.includes(manualType)) setFormType('premium');
    else if (chatbots.includes(manualType)) setFormType('quick');
  };

  if (formType === 'premium') return <PremiumDiscoveryForm />;
  if (formType === 'quick') return <QuickChatbotForm />;

  return (
    <div className="space-y-8">
      {showSelector && (
        <div className="card p-8 sm:p-10 border-gold/20 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-grotesk font-bold text-primary">What Brings You Here?</h3>
            <p className="text-sm text-muted">Select your project type and we'll show you the right form.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="manualType" className="text-xs text-muted uppercase tracking-wider font-medium">Service Needed</label>
            <select id="manualType" value={manualType} onChange={(e) => setManualType(e.target.value)}>
              <option value="">Select a service...</option>
              <optgroup label="AI Automation (Premium Discovery)">
                <option value="ai-automation">AI Workflow Automation</option>
                <option value="business-automation">Business Process Automation</option>
                <option value="custom-ai">Custom AI Systems</option>
                <option value="enterprise-automation">Enterprise Automation</option>
              </optgroup>
              <optgroup label="AI Chatbot (Quick Quote)">
                <option value="chatbot">Conversational AI Chatbot</option>
                <option value="website-bot">Website Chatbot</option>
                <option value="faq-bot">FAQ Bot</option>
                <option value="lead-bot">Lead Generation Bot</option>
              </optgroup>
            </select>
          </div>
          <button onClick={handleManualSelect} disabled={!manualType}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-dim text-darkbg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
