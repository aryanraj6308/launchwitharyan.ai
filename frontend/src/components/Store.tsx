import React, { useState } from 'react';
import { Search, ShoppingBag, Sparkles, Filter, Check, ShieldCheck, AlertCircle } from 'lucide-react';

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
    id: 'infinite-agent-web',
    title: 'Infinite Agent Astro Template',
    category: 'Templates',
    price: 49,
    description: 'A premium, custom-optimized landing page blueprint with GSAP scroll scripts, dark mode variables, and built-in lead forms.',
    features: ['100/100 Core Web Vitals', 'Tailwind CSS v4 config', 'Clean TypeScript support', 'Framer Motion animations'],
    specs: 'Astro 5.0 + React 18'
  },
  {
    id: 'rag-boilerplate',
    title: 'RAG Conversational Boilerplate',
    category: 'Automations',
    price: 79,
    description: 'A production-ready database orchestration template. Connects local vector schemas directly to OpenAI or local models.',
    features: ['Supabase PGVector schema', 'FastAPI backend connection', 'Dynamic prompt logs UI', 'Rate-limiting middleware'],
    specs: 'Python FastAPI + PostgreSQL'
  },
  {
    id: 'seo-prompt-pack',
    title: 'Commercial Intent Prompt Pack',
    category: 'Prompts',
    price: 19,
    description: 'A list of 50+ tested, enterprise-grade system prompts for writing highly structured SEO blog posts that convert users.',
    features: ['Zero hallucination guardrails', 'Markdown outline structuring', 'JSON metadata exports', 'Optimized for GPT-4 / Claude-3'],
    specs: 'Text / JSON configurations'
  },
  {
    id: 'lead-pipeline',
    title: 'Lead Ingestion Automation Kit',
    category: 'Automations',
    price: 39,
    description: 'Clean automated serverless integration script to instantly pipe lead forms to Google Sheets, Notion databases, and Slack channels.',
    features: ['Detailed error log alerts', 'Duplicate deduplication filtering', 'Multi-app delivery triggers', 'Fast validation schemas'],
    specs: 'Node.js / Python Webhook'
  }
];

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filteredProducts = productsData.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (product: Product) => {
    setIsLoading(true);
    setCheckoutProduct(product);

    const isSdkLoaded = await loadRazorpay();
    if (!isSdkLoaded) {
      alert('Razorpay SDK failed to load. Are you connected to the internet?');
      setIsLoading(false);
      return;
    }

    try {
      // Create order in backend
      const response = await fetch('http://localhost:8000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          amount: product.price,
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        
        // Open Razorpay Checkout Modal
        const options = {
          key: orderData.key_id, // Key ID from FastAPI backend
          amount: orderData.amount, // Amount in paise
          currency: orderData.currency,
          name: "LaunchWithAryan AI",
          description: `Purchase of ${product.title}`,
          image: "https://launchwitharyan.ai/favicon.svg",
          order_id: orderData.order_id,
          handler: function (response: any) {
            // Send payment verification request to backend
            fetch('http://localhost:8000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.status === 'success') {
                  alert('Thank you! Your purchase is complete. You can download the item from the dashboard.');
                  window.location.href = '/dashboard';
                } else {
                  alert('Payment verification failed. Please contact support.');
                }
              });
          },
          prefill: {
            name: "Premium Buyer",
            email: "buyer@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#0062ff",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation for offline preview
        simulateCheckout(product);
      }
    } catch (err) {
      // Fallback simulation for offline preview
      simulateCheckout(product);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCheckout = (product: Product) => {
    const confirmBuy = window.confirm(
      `[Offline Sandbox Mode]\n\nProduct: ${product.title}\nPrice: $${product.price}\n\nWould you like to simulate a successful payment and unlock this digital file?`
    );
    if (confirmBuy) {
      alert(`[Demo Mode Success] "${product.title}" has been successfully added to your dashboard profile! Redirecting to Dashboard...`);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="font-sans space-y-12">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/2 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          {['All', 'Templates', 'Prompts', 'Automations'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-300 ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates, prompt packs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Products Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="glassmorphism p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col justify-between space-y-6 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background glowing shape */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

            <div className="space-y-4">
              {/* Category tag & price */}
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-accent-cyan uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  {prod.category}
                </span>
                <span className="text-xl font-bold text-white font-display">${prod.price}</span>
              </div>

              {/* Title & Tech Specs */}
              <div>
                <h3 className="text-xl font-display font-semibold text-white tracking-tight">{prod.title}</h3>
                <span className="text-[11px] text-gray-500 font-mono block mt-1">{prod.specs}</span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed font-sans">{prod.description}</p>

              {/* Features bullets */}
              <div className="space-y-2.5 pt-2">
                {prod.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Action */}
            <button
              onClick={() => handleCheckout(prod)}
              disabled={isLoading && checkoutProduct?.id === prod.id}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark font-sans text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {isLoading && checkoutProduct?.id === prod.id ? 'Processing Purchase...' : 'Buy Now'}
            </button>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-gray-400 font-sans text-sm">No premium products match your query criteria.</p>
          </div>
        )}
      </div>

      {/* Trust elements */}
      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Secure transaction checkouts via Razorpay API.</span>
        </div>
        <div>
          <span>Instant direct download links available post-purchase.</span>
        </div>
      </div>
    </div>
  );
}
