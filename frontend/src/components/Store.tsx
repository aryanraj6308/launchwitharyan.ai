import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Sparkles, Filter, Check, ShieldCheck, AlertCircle, Download } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Product {
  id: string;
  title: string;
  category: 'Templates' | 'Prompts' | 'Automations';
  price: number;
  description: string;
  features: string[];
  specs: string;
  paymentLink: string;
}

const productsData: Product[] = [
  {
    id: 'infinite-agent-web',
    title: 'Infinite Agent Astro Template',
    category: 'Templates',
    price: 999,
    description: 'A premium, custom-optimized landing page blueprint with GSAP scroll scripts, dark mode variables, and built-in lead forms.',
    features: ['100/100 Core Web Vitals', 'Tailwind CSS v4 config', 'Clean TypeScript support', 'Framer Motion animations'],
    specs: 'Astro 5.0 + React 18',
    paymentLink: 'https://rzp.io/rzp/AGENuVaz'
  },
  {
    id: 'rag-boilerplate',
    title: 'RAG Conversational Boilerplate',
    category: 'Automations',
    price: 1499,
    description: 'A production-ready database orchestration template. Connects local vector schemas directly to OpenAI or local models.',
    features: ['Supabase PGVector schema', 'FastAPI backend connection', 'Dynamic prompt logs UI', 'Rate-limiting middleware'],
    specs: 'Python FastAPI + PostgreSQL',
    paymentLink: 'https://rzp.io/rzp/KAlFHQ6'
  },
  {
    id: 'seo-prompt-pack',
    title: 'Commercial Intent Prompt Pack',
    category: 'Prompts',
    price: 299,
    description: 'A list of 50+ tested, enterprise-grade system prompts for writing highly structured SEO blog posts that convert users.',
    features: ['Zero hallucination guardrails', 'Markdown outline structuring', 'JSON metadata exports', 'Optimized for GPT-4 / Claude-3'],
    specs: 'Text / JSON configurations',
    paymentLink: 'https://rzp.io/rzp/AmIkpdx'
  },
  {
    id: 'lead-pipeline',
    title: 'Lead Ingestion Automation Kit',
    category: 'Automations',
    price: 699,
    description: 'Clean automated serverless integration script to instantly pipe lead forms to Google Sheets, Notion databases, and Slack channels.',
    features: ['Detailed error log alerts', 'Duplicate deduplication filtering', 'Multi-app delivery triggers', 'Fast validation schemas'],
    specs: 'Node.js / Python Webhook',
    paymentLink: ''
  }
];

interface PurchaseRecord {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string | null;
}

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('purchase_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('purchase_session_id', sid);
  }
  return sid;
};

const loadPurchasesSafe = (): PurchaseRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('purchased_products');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const savePurchase = (product: Product) => {
  const existing = loadPurchasesSafe();
  if (!existing.find((p) => p.product_id === product.id)) {
    existing.push({
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.title,
      amount: product.price,
      status: 'paid',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('purchased_products', JSON.stringify(existing));
  }
};

const confirmPurchaseWithBackend = async (productId: string, sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl('/api/payments/confirm-purchase'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, session_id: sessionId }),
    });
    const data = await response.json();
    return data.status === 'success' || data.status === 'already_exists';
  } catch {
    return false;
  }
};

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessionId(getSessionId());

    const pending = localStorage.getItem('pending_purchase');
    if (pending) {
      try {
        const { product_id, session_id } = JSON.parse(pending);
        const product = productsData.find((p) => p.id === product_id);
        if (product) {
          savePurchase(product);
          confirmPurchaseWithBackend(product_id, session_id);
        }
      } catch { /* ignore */ }
      localStorage.removeItem('pending_purchase');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = loadPurchasesSafe();
    setPurchasedItems(stored.map((p) => p.product_id));
  }, [mounted]);

  const filteredProducts = productsData.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async (product: Product) => {
    setIsLoading(true);
    setCheckoutProduct(product);

    if (product.paymentLink) {
      localStorage.setItem('pending_purchase', JSON.stringify({ product_id: product.id, session_id: sessionId }));
      window.open(product.paymentLink, '_blank');
      setIsLoading(false);
      setCheckoutProduct(null);
      return;
    }

    simulateCheckout(product);
  };

  const simulateCheckout = async (product: Product) => {
    const confirmBuy = window.confirm(
      `[Offline Sandbox Mode]\n\nProduct: ${product.title}\nPrice: ₹${product.price}\n\nWould you like to simulate a successful payment and unlock this digital file?`
    );
    if (confirmBuy) {
      savePurchase(product);
      setPurchasedItems((prev) => [...prev, product.id]);
      await confirmPurchaseWithBackend(product.id, sessionId);
      alert(`[Demo Mode Success] "${product.title}" has been successfully added to your dashboard! You can now download it.`);
    }
    setIsLoading(false);
    setCheckoutProduct(null);
  };

  return (
    <div className="font-sans space-y-10">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-raised p-4 rounded-xl border border-default">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-muted mr-1 shrink-0" />
          {['All', 'Templates', 'Prompts', 'Automations'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${
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

      {/* Products */}
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
                <span className="text-lg font-grotesk font-bold text-primary">₹{prod.price}</span>
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

            {purchasedItems.includes(prod.id) ? (
              <a
                href={apiUrl(`/api/payments/download/${prod.id}?session_id=${encodeURIComponent(getSessionId())}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-medium text-white transition-all duration-200 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Now
              </a>
            ) : (
              <button
                onClick={() => handleCheckout(prod)}
                disabled={isLoading && checkoutProduct?.id === prod.id}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-dim text-darkbg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                {isLoading && checkoutProduct?.id === prod.id ? 'Processing...' : 'Buy Now'}
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
          <span>Secure transaction checkouts via Razorpay API.</span>
        </div>
        <span>Instant direct download links available post-purchase.</span>
      </div>
    </div>
  );
}
