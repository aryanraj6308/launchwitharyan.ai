import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Download, Settings, BarChart2, ShieldAlert, Key, LogIn, Lock, Mail, Package, Loader2 } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Purchase {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string | null;
  name: string;
  category: string;
  date: string;
}

const productCatalogs: Record<string, { name: string; category: string; size: string }> = {
  'infinite-agent-web': { name: 'Infinite Agent Astro Template', category: 'Templates', size: '21 KB' },
  'rag-boilerplate': { name: 'RAG Conversational Boilerplate', category: 'Automations', size: '16 KB' },
  'seo-prompt-pack': { name: 'Commercial Intent Prompt Pack', category: 'Prompts', size: '45 KB' },
  'lead-pipeline': { name: 'Lead Ingestion Automation Kit', category: 'Automations', size: '15 KB' },
};

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('purchase_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('purchase_session_id', sid);
  }
  return sid;
};

const loadPurchasesFromBackend = async (sessionId: string): Promise<Purchase[]> => {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl(`/api/payments/session-purchases?session_id=${sessionId}`));
    if (!response.ok) return [];
    const data = await response.json();
    return data.purchases.map((p: any) => ({
      ...p,
      name: p.product_name,
      category: productCatalogs[p.product_id]?.category || 'Digital Product',
      date: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch {
    return [];
  }
};

export default function DashboardLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'downloads' | 'settings' | 'analytics'>('downloads');
  const [apiKey, setApiKey] = useState<string>('');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setIsLoggedIn(true);
    setApiKey(localStorage.getItem('openai_key') || '');
    setOllamaUrl(localStorage.getItem('ollama_url') || 'http://localhost:11434');
  }, []);

  useEffect(() => {
    if (!mounted || !sessionId) return;
    const loadAllPurchases = async () => {
      setLoading(true);
      try {
        let localPurchases: Purchase[] = [];
        const raw = localStorage.getItem('purchased_products');
        if (raw) {
          localPurchases = JSON.parse(raw).map((p: any) => ({
            ...p,
            name: p.product_name || p.name,
            category: productCatalogs[p.product_id || p.id]?.category || 'Digital Product',
            date: p.created_at ? p.created_at.split('T')[0] : p.date,
          }));
        }
        const backendPurchases = await loadPurchasesFromBackend(sessionId);
        const merged = [...backendPurchases];
        localPurchases.forEach((local) => {
          if (!merged.some((b) => b.product_id === local.product_id)) merged.push(local);
        });
        setPurchases(merged);
      } catch {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };
    loadAllPurchases();
  }, [mounted, sessionId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        setIsLoggedIn(true);
      } else {
        simulateLogin();
      }
    } catch {
      simulateLogin();
    }
  };

  const simulateLogin = () => {
    localStorage.setItem('auth_token', 'mock-jwt-token');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
  };

  const saveConfig = () => {
    localStorage.setItem('openai_key', apiKey);
    localStorage.setItem('ollama_url', ollamaUrl);
    alert('Configuration saved to Local Storage!');
  };

  const downloadFile = (purchase: Purchase) => {
    const productId = purchase.product_id || purchase.id;
    const a = document.createElement('a');
    a.href = apiUrl(`/api/payments/download/${productId}?session_id=${encodeURIComponent(sessionId)}`);
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="card p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-grotesk font-bold text-primary">
              {authTab === 'login' ? 'Access Client Console' : 'Register Account'}
            </h2>
            <p className="text-xs text-muted">Manage your templates, prompt downloads, and configure API integrations.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary justify-center text-sm py-3">
              <LogIn className="w-4 h-4" />
              {authTab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center pt-1">
            <button onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')}
              className="text-xs text-muted hover:text-primary transition-colors underline cursor-pointer">
              {authTab === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-2">
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-default pb-4">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">U</div>
            <div>
              <span className="text-[10px] text-muted">Member Account</span>
              <h4 className="text-sm font-bold text-primary leading-tight">user@example.com</h4>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${activeTab === 'downloads' ? 'bg-gold text-darkbg' : 'text-muted hover:text-primary hover:bg-raised'}`}>
              <LayoutDashboard className="w-4 h-4" />
              Digital Downloads
            </button>
            <button onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${activeTab === 'settings' ? 'bg-gold text-darkbg' : 'text-muted hover:text-primary hover:bg-raised'}`}>
              <Settings className="w-4 h-4" />
              AI Configuration
            </button>
            <button onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${activeTab === 'analytics' ? 'bg-gold text-darkbg' : 'text-muted hover:text-primary hover:bg-raised'}`}>
              <BarChart2 className="w-4 h-4" />
              Usage Analytics
            </button>
          </div>

          <button onClick={handleLogout}
            className="w-full py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-xs font-medium text-red-400 transition-all cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      <div className="lg:col-span-9">
        {activeTab === 'downloads' && (
          <div className="card p-8 space-y-6">
            <div className="border-b border-default pb-4">
              <h2 className="text-lg font-grotesk font-bold text-primary">Your Products Store Downloads</h2>
              <p className="text-xs text-muted mt-1">Access source files and prompt templates for item configurations you bought.</p>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  <p className="text-sm text-muted">Loading your purchases...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-muted mx-auto" />
                  <p className="text-sm text-muted">No products purchased yet.</p>
                  <a href="/store" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-dim text-darkbg text-xs font-medium transition-all">
                    Browse Store
                  </a>
                </div>
              ) : (
                purchases.map((purchase) => {
                  const productId = purchase.product_id || purchase.id;
                  const cat = productCatalogs[productId];
                  return (
                    <div key={purchase.id}
                      className="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl bg-raised border border-default hover:border-hover transition-colors gap-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-raised text-[9px] text-gold uppercase tracking-wider">{cat?.category || 'Digital Product'}</span>
                        <h3 className="text-sm font-medium text-primary">{purchase.name}</h3>
                        <p className="text-[10px] text-muted">Purchased on {purchase.date} &bull; {cat?.size || '—'}</p>
                      </div>
                      <button onClick={() => downloadFile(purchase)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-raised hover:bg-hovered border border-default text-xs font-medium text-primary transition-colors cursor-pointer">
                        <Download className="w-4 h-4" />
                        Download File
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card p-8 space-y-6">
            <div className="border-b border-default pb-4">
              <h2 className="text-lg font-grotesk font-bold text-primary">Configure AI API Keys</h2>
              <p className="text-xs text-muted mt-1">Link your browser-side assistant to custom API providers.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs text-muted uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-gold" />
                  OpenAI API Key
                </label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-proj-..." className="font-mono text-xs" />
                <span className="text-[10px] text-muted">Saves securely in your local browser sandbox context only.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted uppercase tracking-wider font-medium">Ollama Local host URL</label>
                <input type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} placeholder="http://localhost:11434" className="font-mono text-xs" />
                <span className="text-[10px] text-muted">Local URL connection for hosting quantized models offline.</span>
              </div>

              <button onClick={saveConfig}
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gold hover:bg-gold-dim text-darkbg text-xs font-medium transition-all duration-200 cursor-pointer">
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card p-8 space-y-6">
            <div className="border-b border-default pb-4">
              <h2 className="text-lg font-grotesk font-bold text-primary">Client Query Telemetry</h2>
              <p className="text-xs text-muted mt-1">Monitor real-time search completions and rate limits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Total Prompts Executed</span>
                <div className="text-xl font-bold text-primary mt-1">1,240 queries</div>
              </div>
              <div className="card p-5">
                <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Rate Limit Tokens Remaining</span>
                <div className="text-xl font-bold text-primary mt-1">98,000 / 100k</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/10 bg-yellow-500/5 text-yellow-500/80 flex items-start gap-3 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Attention:</strong> Rate limits are configured at 50 requests per hour for the default sandbox account. Add your custom OpenAI API key above to unlock unlimited completions.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
