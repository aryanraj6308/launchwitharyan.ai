import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MessageSquare, Users, TrendingUp, Phone, Mail, Calendar,
  Download, Bot, Sparkles, ChevronRight, Search, RefreshCw, ArrowUpRight,
  Clock, DollarSign, Target, Activity, Shield, Eye, EyeOff, Loader2,
  UserCheck, UserPlus, Zap, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Conversation {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  business_type: string | null;
  budget_range: string | null;
  requirements: string | null;
  lead_score: number;
  lead_status: string;
  source_page: string | null;
  is_active: boolean;
  wants_human: boolean;
  message_count: number;
  created_at: string | null;
  updated_at: string | null;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  message_type: string;
  created_at: string | null;
}

interface Analytics {
  leads: {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    new_leads: number;
    converted_leads: number;
    avg_lead_score: number;
    total_potential_revenue: number;
  };
  conversations: {
    total_conversations: number;
    active_conversations: number;
    human_handoff_requested: number;
    follow_ups_scheduled: number;
    follow_ups_sent: number;
    discovery_calls_booked: number;
  };
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    new: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    qualified: 'bg-green-500/20 text-green-400 border-green-500/30',
    converted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    lost: 'bg-red-900/20 text-red-600 border-red-900/30',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${colors[status] || colors.new}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'analytics'>('overview');

  useEffect(() => {
    const t = getToken();
    if (t) {
      setToken(t);
      setShowLogin(false);
      checkAdmin(t);
    }
  }, []);

  const checkAdmin = async (t: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.is_admin);
        if (data.is_admin) {
          fetchData(t);
        }
      }
    } catch { /* */ }
  };

  const fetchData = async (t: string) => {
    setLoading(true);
    try {
      const [analyticsRes, conversationsRes] = await Promise.all([
        fetch(apiUrl('/api/ai/analytics'), { headers: { Authorization: `Bearer ${t}` } }),
        fetch(apiUrl('/api/ai/conversations'), { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (conversationsRes.ok) setConversations(await conversationsRes.json());
    } catch { /* */ } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('auth_token', data.access_token);
        setToken(data.access_token);
        setShowLogin(false);
        checkAdmin(data.access_token);
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Login failed');
        setLoading(false);
      }
    } catch {
      setAuthError('Server unreachable');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setIsAdmin(false);
    setShowLogin(true);
    setAnalytics(null);
    setConversations([]);
  };

  const loadConversationDetail = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const res = await fetch(apiUrl(`/api/ai/conversations/${conv.session_id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { /* */ } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchSearch = !searchTerm || 
      (c.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.visitor_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.business_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.lead_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Login Screen
  if (showLogin) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="card p-8 space-y-6">
          <div className="text-center space-y-2">
            <Shield className="w-8 h-8 text-gold mx-auto" />
            <h2 className="text-xl font-grotesk font-bold text-primary">Admin Access</h2>
            <p className="text-xs text-muted">Sign in with admin credentials to view the dashboard.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email" className="w-full" />
            <input type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" className="w-full" />
            {authError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{authError}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-grotesk font-bold text-primary mb-2">Access Denied</h3>
        <p className="text-sm text-muted mb-4">You need admin privileges to view this dashboard.</p>
        <button onClick={handleLogout} className="btn-secondary text-sm">Sign Out</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-raised border border-default rounded-xl p-1">
          {(['overview', 'conversations', 'analytics'] as const).map((tab) => (
            <button key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'conversations') setSelectedConv(null);
              }}
              className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer min-h-[44px] ${
                activeTab === tab ? 'bg-gold text-darkbg' : 'text-muted hover:text-primary'
              }`}>
              {tab === 'overview' && <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === 'conversations' && <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === 'analytics' && <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(token!)} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 min-h-[44px]">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button onClick={handleLogout}
            className="text-xs text-muted hover:text-red-400 transition-colors py-2 px-3 cursor-pointer min-h-[44px] flex items-center">
            Logout
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card p-4">
              <MessageSquare className="w-4 h-4 text-gold mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.conversations.total_conversations}</div>
              <p className="text-[10px] text-muted">Total Conversations</p>
            </div>
            <div className="card p-4">
              <Activity className="w-4 h-4 text-green-400 mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.conversations.active_conversations}</div>
              <p className="text-[10px] text-muted">Active Now</p>
            </div>
            <div className="card p-4">
              <Target className="w-4 h-4 text-red-400 mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.leads.hot_leads}</div>
              <p className="text-[10px] text-muted">Hot Leads</p>
            </div>
            <div className="card p-4">
              <Phone className="w-4 h-4 text-purple-400 mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.conversations.human_handoff_requested}</div>
              <p className="text-[10px] text-muted">Handoff Requests</p>
            </div>
            <div className="card p-4">
              <Mail className="w-4 h-4 text-blue-400 mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.conversations.follow_ups_sent}</div>
              <p className="text-[10px] text-muted">Follow-ups Sent</p>
            </div>
            <div className="card p-4">
              <Calendar className="w-4 h-4 text-emerald-400 mb-2" />
              <div className="text-2xl font-grotesk font-bold text-primary">{analytics.conversations.discovery_calls_booked}</div>
              <p className="text-[10px] text-muted">Calls Booked</p>
            </div>
          </div>

          {/* Revenue + Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-grotesk font-bold text-primary">Lead Distribution</h3>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span>Avg Score: {analytics.leads.avg_lead_score.toFixed(1)}</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Hot', count: analytics.leads.hot_leads, color: 'bg-red-500', percent: analytics.leads.total_leads ? (analytics.leads.hot_leads / analytics.leads.total_leads) * 100 : 0 },
                  { label: 'Warm', count: analytics.leads.warm_leads, color: 'bg-yellow-500', percent: analytics.leads.total_leads ? (analytics.leads.warm_leads / analytics.leads.total_leads) * 100 : 0 },
                  { label: 'Cold', count: analytics.leads.cold_leads, color: 'bg-blue-500', percent: analytics.leads.total_leads ? (analytics.leads.cold_leads / analytics.leads.total_leads) * 100 : 0 },
                  { label: 'New', count: analytics.leads.new_leads, color: 'bg-gray-500', percent: analytics.leads.total_leads ? (analytics.leads.new_leads / analytics.leads.total_leads) * 100 : 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-10">{item.label}</span>
                    <div className="flex-1 h-2 bg-raised rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-primary w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-grotesk font-bold text-primary">Revenue Potential</h3>
              </div>
              <div className="text-2xl font-grotesk font-bold gradient-gold">
                ${analytics.leads.total_potential_revenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted mt-1">Estimated pipeline value</p>
              <div className="mt-4 pt-4 border-t border-default space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Hot leads @ ~$10k</span>
                  <span className="text-primary font-medium">${(analytics.leads.hot_leads * 10000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Warm leads @ ~$5k</span>
                  <span className="text-primary font-medium">${(analytics.leads.warm_leads * 5000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Cold leads @ ~$1k</span>
                  <span className="text-primary font-medium">${(analytics.leads.cold_leads * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-grotesk font-bold text-primary">Recent Conversations</h3>
              <button onClick={() => setActiveTab('conversations')}
                className="text-xs text-gold hover:underline cursor-pointer flex items-center gap-1 py-2 min-h-[44px]">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div key={conv.id}
                  onClick={() => { loadConversationDetail(conv); setActiveTab('conversations'); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-raised border border-default hover:border-hover transition-colors cursor-pointer min-h-[60px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      conv.lead_status === 'hot' ? 'bg-red-500/20 text-red-400' :
                      conv.lead_status === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {conv.visitor_name ? conv.visitor_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary truncate">
                        {conv.visitor_name || 'Anonymous'} {conv.wants_human && <span className="text-purple-400">🔔</span>}
                      </p>
                      <p className="text-[10px] text-muted truncate">{conv.visitor_email || conv.business_type || 'No contact'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={conv.lead_status} />
                    <span className="text-[10px] text-muted">{conv.message_count} msgs</span>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-muted text-center py-8">No conversations yet. Start chatting on the website!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Conversation List */}
          <div className={`${selectedConv ? 'hidden lg:block lg:col-span-5' : 'col-span-1'}`}>
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-grotesk font-bold text-primary">All Conversations</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input type="text" placeholder="Search..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 py-2 text-xs w-full sm:w-40 min-h-[44px]" />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs py-2 w-24 min-h-[44px]">
                    <option value="all">All</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                    <option value="new">New</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No conversations match your filters.</p>
                ) : filteredConversations.map((conv) => (
                  <div key={conv.id}
                    onClick={() => loadConversationDetail(conv)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer min-h-[60px] ${
                      selectedConv?.id === conv.id
                        ? 'bg-gold/10 border border-gold/30'
                        : 'hover:bg-raised border border-transparent'
                    }`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        conv.lead_status === 'hot' ? 'bg-red-500/20 text-red-400' :
                        conv.lead_status === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {conv.visitor_name ? conv.visitor_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-primary truncate">
                            {conv.visitor_name || 'Anonymous'}
                          </p>
                          {conv.wants_human && <span className="text-[9px] text-purple-400">🔔</span>}
                        </div>
                        <p className="text-[10px] text-muted truncate">
                          {conv.visitor_email || conv.business_type || 'No contact info'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="text-right">
                        <StatusBadge status={conv.lead_status} />
                        <div className="text-[9px] text-muted mt-0.5">{conv.message_count} msgs</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation Detail */}
          {selectedConv && (
            <div className="lg:col-span-7 col-span-1">
              <div className="card p-5 h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-default">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedConv(null)}
                        className="lg:hidden text-muted hover:text-primary p-1 cursor-pointer mr-1">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <h3 className="text-sm font-grotesk font-bold text-primary truncate">
                        {selectedConv.visitor_name || 'Anonymous Visitor'}
                      </h3>
                      <StatusBadge status={selectedConv.lead_status} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-muted">
                      {selectedConv.visitor_email && <span>{selectedConv.visitor_email}</span>}
                      {selectedConv.visitor_phone && <span>{selectedConv.visitor_phone}</span>}
                      {selectedConv.business_type && <span>{selectedConv.business_type}</span>}
                      {selectedConv.budget_range && <span>Budget: {selectedConv.budget_range}</span>}
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <button onClick={() => setSelectedConv(null)}
                      className="text-muted hover:text-primary p-1 cursor-pointer">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lead Score Detail */}
                <div className="flex items-center gap-3 mb-4 bg-raised rounded-xl p-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted">Lead Score</span>
                      <span className="text-xs font-bold text-primary">{selectedConv.lead_score}/100</span>
                    </div>
                    <div className="h-1.5 bg-theme-primary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        selectedConv.lead_score >= 70 ? 'bg-green-500' :
                        selectedConv.lead_score >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} style={{ width: `${selectedConv.lead_score}%` }} />
                    </div>
                  </div>
                  {selectedConv.wants_human && (
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                      Handoff requested
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {loadingMessages ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-5 h-5 text-gold animate-spin mx-auto" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">No messages in this conversation.</p>
                  ) : messages.map((msg, i) => (
                    <div key={msg.id || i}
                      className={`flex gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] ${
                        msg.sender === 'user' ? 'bg-gold text-darkbg' : 'bg-raised text-gold border border-default'
                      }`}>
                        {msg.sender === 'user' ? 'U' : 'A'}
                      </div>
                      <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gold text-darkbg rounded-tr-none'
                          : 'bg-raised border border-default text-secondary rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-default flex gap-2">
                  {selectedConv.visitor_email && (
                    <a href={`mailto:${selectedConv.visitor_email}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-raised border border-default text-xs text-primary hover:bg-hovered transition-all cursor-pointer">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                  {selectedConv.visitor_phone && (
                    <a href={`tel:${selectedConv.visitor_phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-raised border border-default text-xs text-primary hover:bg-hovered transition-all cursor-pointer">
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <div className="text-3xl font-grotesk font-bold gradient-gold mb-1">
                {analytics.conversations.total_conversations}
              </div>
              <p className="text-xs text-muted">Total Conversations</p>
            </div>
            <div className="card p-5 text-center">
              <div className="text-3xl font-grotesk font-bold text-primary mb-1">
                {analytics.leads.avg_lead_score.toFixed(1)}
              </div>
              <p className="text-xs text-muted">Average Lead Score</p>
            </div>
            <div className="card p-5 text-center">
              <div className="text-3xl font-grotesk font-bold text-primary mb-1">
                {analytics.conversations.follow_ups_sent}
              </div>
              <p className="text-xs text-muted">Follow-ups Sent</p>
            </div>
            <div className="card p-5 text-center">
              <div className="text-3xl font-grotesk font-bold text-primary mb-1">
                ${analytics.leads.total_potential_revenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted">Pipeline Value</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-grotesk font-bold text-primary mb-4">Lead Funnel</h3>
            <div className="space-y-4">
              {[
                { stage: 'New → Engaged', count: analytics.leads.new_leads, pct: analytics.leads.total_leads ? Math.round((analytics.leads.new_leads / analytics.leads.total_leads) * 100) : 0 },
                { stage: 'Cold', count: analytics.leads.cold_leads, pct: analytics.leads.total_leads ? Math.round((analytics.leads.cold_leads / analytics.leads.total_leads) * 100) : 0 },
                { stage: 'Warm', count: analytics.leads.warm_leads, pct: analytics.leads.total_leads ? Math.round((analytics.leads.warm_leads / analytics.leads.total_leads) * 100) : 0 },
                { stage: 'Hot', count: analytics.leads.hot_leads, pct: analytics.leads.total_leads ? Math.round((analytics.leads.hot_leads / analytics.leads.total_leads) * 100) : 0 },
              ].map((item, i) => (
                <div key={item.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{item.stage}</span>
                    <span className="text-primary font-medium">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-raised rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      i === 0 ? 'bg-gray-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
