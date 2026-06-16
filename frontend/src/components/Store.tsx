import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, Sparkles, Filter, Check, ShieldCheck, AlertCircle, Download, Loader2, LogIn } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Product {
  id: string;
  title: string;
  category: 'Templates' | 'Prompts' | 'Automations';
  price: number;
  description: string;
  features: string[];
  specs: string;
}

const productsData: Product[] = [
  {
    id: 'commercial-intent-prompt-pack',
    title: 'Commercial Intent Prompt Pack',
    category: 'Prompts',
    price: 299,
    description: '52 enterprise-grade SEO prompts with JSON metadata exports. Includes blog writer, hallucination-free research, conversion copy, schema markup, and 48 more specialized prompts.',
    features: ['52 tested SEO prompts', 'JSON + Markdown formats', 'Zero hallucination guardrails', 'Buyer intent optimization', 'GPT-4 / Claude compatible'],
    specs: 'Text + JSON, 1.9MB total',
  },
  {
    id: 'seo-content-pillar',
    title: 'SEO Content Cluster Planner',
    category: 'Templates',
    price: 599,
    description: 'A complete content cluster planning template with AI-powered keyword clustering, topical map generator, and editorial calendar automation.',
    features: ['AI keyword clustering engine', 'Topical authority map', 'Editorial calendar automation', 'Competitor gap analysis', 'SERP opportunity scoring'],
    specs: 'Astro + Python, 2.3MB',
  },
  {
    id: 'ai-chatbot-ui',
    title: 'AI Chatbot UI Component Kit',
    category: 'Templates',
    price: 799,
    description: 'Production-ready chatbot UI components with typing indicators, lead capture forms, conversation history, and multi-channel adapters.',
    features: ['React + TypeScript', 'Lead capture with scoring', 'Conversation history view', 'Multi-channel adapters', 'Dark/light theme support'],
    specs: 'React 19 + Tailwind v4, 1.1MB',
  },
  {
    id: 'social-ai-automation',
    title: 'Social Media AI Automation Kit',
    category: 'Automations',
    price: 899,
    description: 'AI-powered social media automation with auto-content generation, scheduling, analytics, and cross-platform publishing.',
    features: ['AI content generation', 'Auto-scheduling engine', 'Cross-platform publishing', 'Engagement analytics', 'Hashtag optimization'],
    specs: 'Node.js + Python, 1.7MB',
  },
  {
    id: 'lead-pipeline',
    title: 'Lead Ingestion Automation Kit',
    category: 'Automations',
    price: 699,
    description: 'Clean automated serverless integration script to instantly pipe lead forms to Google Sheets, Notion databases, and Slack channels.',
    features: ['Detailed error log alerts', 'Duplicate deduplication filtering', 'Multi-app delivery triggers', 'Fast validation schemas'],
    specs: 'Node.js / Python Webhook',
  },
  {
    id: 'rag-boilerplate',
    title: 'RAG Conversational Boilerplate',
    category: 'Automations',
    price: 1499,
    description: 'A production-ready database orchestration template. Connects local vector schemas directly to OpenAI or local models.',
    features: ['Supabase PGVector schema', 'FastAPI backend connection', 'Dynamic prompt logs UI', 'Rate-limiting middleware'],
    specs: 'Python FastAPI + PostgreSQL',
  },
  {
    id: 'infinite-agent-web',
    title: 'Infinite Agent Astro Template',
    category: 'Templates',
    price: 999,
    description: 'A premium, custom-optimized landing page blueprint with GSAP scroll scripts, dark mode variables, and built-in lead forms.',
    features: ['100/100 Core Web Vitals', 'Tailwind CSS v4 config', 'Clean TypeScript support', 'Framer Motion animations'],
    specs: 'Astro 5.0 + React 18',
  },
];

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
}

const INR_TO_USD = 0.012;

function formatPrice(priceInr: number, currency: string): string {
  if (currency === 'USD') return `$${(priceInr * INR_TO_USD).toFixed(2)}`;
  return `₹${priceInr}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checkingProduct, setCheckingProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    const cur = localStorage.getItem('preferred_currency');
    if (cur === 'INR' || cur === 'USD') setCurrency(cur);
    const handler = () => {
      const c = localStorage.getItem('preferred_currency');
      if (c === 'INR' || c === 'USD') setCurrency(c);
    };
    window.addEventListener('currencyChange', handler);
    return () => window.removeEventListener('currencyChange', handler);
  }, []);

  const checkAllPurchases = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const purchased = new Set<string>();
    try {
      const res = await fetch(apiUrl('/api/payments/my-purchases'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const p of data.purchases || []) {
          purchased.add(p.product_id);
        }
      }
    } catch {
      // Backend unreachable
    }
    setPurchasedIds(purchased);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAllPurchases();
  }, [checkAllPurchases]);

  const filteredProducts = productsData.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async (product: Product) => {
    clearError();
    const token = getToken();
    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent('/store')}`;
      return;
    }

    setCheckingProduct(product.id);

    try {
      const orderRes = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        setError(err.detail || 'Failed to create order. Please try again.');
        setCheckingProduct(null);
        return;
      }

      const orderData = await orderRes.json();

      if (typeof (window as any).Razorpay === 'undefined') {
        setError('Payment system loading. Please refresh and try again.');
        setCheckingProduct(null);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AryanForge',
        description: product.title,
        order_id: orderData.order_id,
        prefill: { email: orderData.user_email },
        modal: {
          ondismiss: () => {
            setCheckingProduct(null);
          },
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch(apiUrl('/api/payments/verify-payment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              if (verifyData.status === 'success' || verifyData.status === 'already_verified') {
                await checkAllPurchases();
                setCheckingProduct(null);
                return;
              }
            }

            const verifyErr = await verifyRes.json().catch(() => ({}));
            setError(verifyErr.detail || 'Payment verification failed. Contact support with your payment ID.');
          } catch {
            setError('Payment verification failed. Contact support with your payment ID.');
          }
          setCheckingProduct(null);
        },
      } as RazorpayOptions);

      rzp.open();
    } catch {
      setError('Failed to initiate checkout. Please try again.');
      setCheckingProduct(null);
    }
  };

  const handleDownload = (productId: string) => {
    const token = getToken();
    if (!token) return;
    const a = document.createElement('a');
    a.href = apiUrl(`/api/payments/download/${productId}`);
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="font-sans space-y-10">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 cursor-pointer">&times;</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-raised p-4 rounded-xl border border-default">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-muted mr-1 shrink-0" />
          {['All', 'Templates', 'Prompts', 'Automations'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[44px] ${
                selectedCategory === cat
                  ? 'bg-gold text-darkbg'
                  : 'text-secondary hover:text-primary hover:bg-raised'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="card card-hover p-6 lg:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-full h-36 rounded-xl overflow-hidden bg-raised border border-default">
                <img
                  src={prod.category === 'Templates' ? '/images/store-template.svg' : prod.category === 'Prompts' ? '/images/store-prompts.svg' : '/images/store-boilerplate.svg'}
                  alt={prod.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-raised border border-default text-[10px] font-medium text-gold">
                  <Sparkles className="w-3 h-3" />
                  {prod.category}
                </span>
                <span className="text-lg font-grotesk font-bold text-primary">{formatPrice(prod.price, currency)}</span>
              </div>

              <div>
                <h3 className="font-grotesk font-semibold text-primary">{prod.title}</h3>
                <span className="text-[11px] text-muted block mt-0.5">{prod.specs}</span>
              </div>

              <p className="text-sm text-secondary">{prod.description}</p>

              <div className="space-y-2">
                {prod.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-secondary">
                    <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {purchasedIds.has(prod.id) ? (
              <button
                onClick={() => handleDownload(prod.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-medium text-white transition-all duration-200 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            ) : (
              <button
                onClick={() => handleCheckout(prod)}
                disabled={checkingProduct === prod.id}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-dim text-darkbg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {checkingProduct === prod.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : !isLoggedIn ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login to Buy
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Buy Now
                  </>
                )}
              </button>
            )}
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-muted mx-auto" />
            <p className="text-sm text-muted">No premium products match your query criteria.</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-default flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Secure checkout via Razorpay. Payments verified server-side.</span>
        </div>
        <span>Download access granted only after payment verification.</span>
      </div>
    </div>
  );
}
