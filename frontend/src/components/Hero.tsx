import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="hero-orb w-[600px] h-[600px] bg-gold/5 top-[-10%] left-[-5%] animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="hero-orb w-[400px] h-[400px] bg-gold/5 bottom-[-10%] right-[-5%] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="hero-orb w-[300px] h-[300px] bg-gold/5 top-[40%] right-[20%] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[-5%] left-0 w-full h-[50%] bg-gradient-to-b from-gold/[0.03] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-secondary bg-raised border border-default mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Premium AI Automation Studio
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-grotesk font-bold tracking-tight leading-[1.05] text-primary mb-6">
              AI Agents That<br />
              <span className="gradient-text-shimmer">Scale Your Business</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 text-secondary">
              We build autonomous AI agents and premium web platforms that automate lead generation, customer support, and business workflows — delivering 10x efficiency for forward-thinking enterprises.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mt-10">
              <a href="/contact" className="btn-primary text-base min-h-[48px]">
                Book a Free Call <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/portfolio" className="btn-secondary text-base min-h-[48px]">
                <Play className="w-4 h-4" /> See Our Work
              </a>
            </div>

            {/* Trust bar */}
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="trust-bar-item">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                SOC 2 Compliant
              </div>
              <div className="trust-bar-item">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Enterprise-Grade Security
              </div>
              <div className="trust-bar-item">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                24/7 AI-Powered Support
              </div>
            </div>
          </div>

          {/* AI Agent Cards */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="agent-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="agent-avatar">A</div>
                <h3 className="font-grotesk font-semibold text-sm text-primary mb-1">Aria</h3>
                <p className="text-[11px] text-muted">Autonomous Workflow Agent</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                </div>
              </div>
              <div className="agent-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="agent-avatar" style={{ animationDelay: '1s' }}>N</div>
                <h3 className="font-grotesk font-semibold text-sm text-primary mb-1">Nova</h3>
                <p className="text-[11px] text-muted">Web Intelligence Agent</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                </div>
              </div>
              <div className="agent-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="agent-avatar" style={{ animationDelay: '2s' }}>O</div>
                <h3 className="font-grotesk font-semibold text-sm text-primary mb-1">Orion</h3>
                <p className="text-[11px] text-muted">Conversational AI</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                </div>
              </div>
              <div className="agent-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="agent-avatar" style={{ animationDelay: '3s' }}>S</div>
                <h3 className="font-grotesk font-semibold text-sm text-primary mb-1">Sage</h3>
                <p className="text-[11px] text-muted">SEO Automation Engine</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 pt-10 border-t border-default">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center lg:text-left">
              <div className="metric-value gradient-gold">150+</div>
              <div className="metric-label">Projects Delivered</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="metric-value gradient-gold">99.9%</div>
              <div className="metric-label">Uptime Reliability</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="metric-value gradient-gold">$2.4M+</div>
              <div className="metric-label">Saved For Clients</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="metric-value gradient-gold">40%</div>
              <div className="metric-label">Avg. Conversion Lift</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
