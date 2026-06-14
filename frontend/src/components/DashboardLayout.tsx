import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Download, Settings, BarChart2, ShieldAlert, Key, LogIn, Lock, Mail, User } from 'lucide-react';

interface Purchase {
  id: string;
  name: string;
  category: string;
  date: string;
  fileSize: string;
}

const mockPurchases: Purchase[] = [
  { id: 'infinite-agent-web', name: 'Infinite Agent Astro Template', category: 'Templates', date: '2026-06-12', fileSize: '14.2 MB' },
  { id: 'seo-prompt-pack', name: 'Commercial Intent Prompt Pack', category: 'Prompts', date: '2026-06-12', fileSize: '1.8 MB' }
];

export default function DashboardLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'downloads' | 'settings' | 'analytics'>('downloads');
  const [apiKey, setApiKey] = useState<string>('');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
    }
    // Load config keys
    setApiKey(localStorage.getItem('openai_key') || '');
    setOllamaUrl(localStorage.getItem('ollama_url') || 'http://localhost:11434');
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        setIsLoggedIn(true);
      } else {
        // Fallback login simulation
        simulateLogin();
      }
    } catch (err) {
      // Fallback login simulation
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
    alert(`Downloading ${purchase.name} source files (${purchase.fileSize})...`);
  };

  // Auth Screen Layout
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="glassmorphism p-8 sm:p-10 rounded-3xl border border-subtle space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-grotesk font-bold text-theme-primary">
              {authTab === 'login' ? 'Access Client Console' : 'Register Account'}
            </h2>
            <p className="text-xs text-theme-muted">
              Manage your templates, prompt downloads, and configure API integrations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-theme-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-elevated border border-subtle text-theme-primary placeholder:text-placeholder focus:outline-none focus:border-primary/50 text-sm transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-theme-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-elevated border border-subtle text-theme-primary placeholder:text-placeholder focus:outline-none focus:border-primary/50 text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark font-sans text-sm font-semibold text-theme-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {authTab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {/* Tab toggles */}
          <div className="text-center pt-2">
            <button
              onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')}
              className="text-xs text-theme-muted hover:text-theme-primary transition-colors underline cursor-pointer"
            >
              {authTab === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen Layout
  return (
    <div className="font-sans grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Panel */}
      <div className="lg:col-span-3 space-y-2">
        <div className="glassmorphism p-6 rounded-2xl border border-subtle space-y-6">
          <div className="flex items-center gap-3 border-b border-subtle pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              U
            </div>
            <div>
              <span className="text-xs text-theme-muted font-mono">Member Account</span>
              <h4 className="text-sm font-bold text-theme-primary leading-tight">user@example.com</h4>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'downloads' ? 'bg-primary text-theme-primary' : 'text-theme-muted hover:text-theme-primary hover:bg-elevated'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Digital Downloads
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'settings' ? 'bg-primary text-theme-primary' : 'text-theme-muted hover:text-theme-primary hover:bg-elevated'
              }`}
            >
              <Settings className="w-4 h-4" />
              AI Service Configuration
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics' ? 'bg-primary text-theme-primary' : 'text-theme-muted hover:text-theme-primary hover:bg-elevated'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Usage Analytics
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-xs font-semibold text-red-400 transition-all duration-300 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        {activeTab === 'downloads' && (
          <div className="glassmorphism p-8 rounded-3xl border border-subtle space-y-6">
            <div className="border-b border-subtle pb-4">
              <h2 className="text-xl font-grotesk font-bold text-theme-primary">Your Products Store Downloads</h2>
              <p className="text-xs text-theme-muted font-sans mt-1">Access source files and prompt templates for item configurations you bought.</p>
            </div>

            <div className="space-y-4">
              {mockPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-2xl bg-elevated border border-subtle hover:border-subtle transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-elevated text-[9px] font-mono text-gold uppercase tracking-wider">
                      {purchase.category}
                    </span>
                    <h3 className="text-sm font-bold text-theme-primary">{purchase.name}</h3>
                    <p className="text-[10px] text-theme-muted">Purchased on {purchase.date} • {purchase.fileSize}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(purchase)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-elevated hover:bg-hover border border-subtle text-xs font-semibold text-theme-primary transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glassmorphism p-8 rounded-3xl border border-subtle space-y-6">
            <div className="border-b border-subtle pb-4">
              <h2 className="text-xl font-grotesk font-bold text-theme-primary">Configure AI API Keys</h2>
              <p className="text-xs text-theme-muted font-sans mt-1">Link your browser-side assistant to custom API providers.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-primary" />
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-3 rounded-xl bg-elevated border border-subtle text-theme-primary placeholder:text-placeholder focus:outline-none focus:border-primary/50 text-xs transition-colors font-mono"
                />
                <span className="text-[10px] text-theme-muted block">Saves securely in your local browser sandbox context only.</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Ollama Local host URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-4 py-3 rounded-xl bg-elevated border border-subtle text-theme-primary placeholder:text-placeholder focus:outline-none focus:border-primary/50 text-xs transition-colors font-mono"
                />
                <span className="text-[10px] text-theme-muted block">Local URL connection for hosting quantized models offline.</span>
              </div>

              <button
                onClick={saveConfig}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark font-sans text-xs font-semibold text-theme-primary transition-all duration-300 cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glassmorphism p-8 rounded-3xl border border-subtle space-y-6">
            <div className="border-b border-subtle pb-4">
              <h2 className="text-xl font-grotesk font-bold text-theme-primary">Client Query Telemetry</h2>
              <p className="text-xs text-theme-muted font-sans mt-1">Monitor real-time search completions and rate limits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-elevated p-5 rounded-2xl border border-subtle">
                <span className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold">Total Prompts Executed</span>
                <div className="text-2xl font-bold text-theme-primary mt-1">1,240 queries</div>
              </div>
              <div className="bg-elevated p-5 rounded-2xl border border-subtle">
                <span className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold">Rate Limit Tokens Remaining</span>
                <div className="text-2xl font-bold text-theme-primary mt-1">98,000 / 100k</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/10 bg-yellow-500/5 text-yellow-500/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs leading-relaxed">
                <strong>Attention:</strong> Rate limits are configured at 50 requests per hour for the default sandbox account. Add your custom OpenAI API key above to unlock unlimited completions.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
