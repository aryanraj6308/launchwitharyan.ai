import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] p-3 sm:p-4 animate-fade-in">
      <div className="max-w-5xl mx-auto card border border-default rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-2xl">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-gold" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs sm:text-sm text-primary font-medium">We use cookies</p>
            <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
              This site uses essential cookies for functionality and analytics cookies to improve your experience.
              Read our <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a> and <a href="/terms" className="text-gold hover:underline">Terms</a>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-default text-xs text-muted hover:text-primary hover:bg-raised transition-all cursor-pointer min-h-[44px]">
            Decline
          </button>
          <button onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gold text-darkbg text-xs font-medium hover:bg-gold-dim transition-all cursor-pointer min-h-[44px]">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
