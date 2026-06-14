import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section class="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20">
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute top-[-5%] left-0 w-full h-[50%] bg-gradient-to-b from-gold/[0.03] to-transparent" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <div class="lg:col-span-7 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-secondary bg-raised border border-default mb-8">
              Premium AI Automation Studio
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-grotesk font-bold tracking-tight leading-[1.05] text-primary">
              Scale Your Business<br />
              With <span class="gradient-gold">AI Automation</span>
            </h1>

            <p class="mt-6 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 text-secondary">
              We automate lead generation, customer support, and business workflows using AI — helping businesses save time and increase revenue.
            </p>

            <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mt-10">
              <a href="/contact" class="btn-primary text-base">
                Book a Free Call <ArrowRight class="w-4 h-4" />
              </a>
              <a href="/portfolio" class="btn-secondary text-base">
                See Our Work
              </a>
            </div>
          </div>

          <div class="hidden lg:block lg:col-span-5">
            <img src="/images/hero-dashboard.svg" alt="AI Automation Dashboard" class="w-full h-auto" loading="eager" />
          </div>
        </div>

        <div class="mt-16 pt-8 border-t border-default max-w-lg">
          <div class="grid grid-cols-3 gap-8">
            <div>
              <div class="text-xl lg:text-2xl font-grotesk font-bold text-primary">150+</div>
              <div class="text-xs text-muted mt-1">Projects Delivered</div>
            </div>
            <div>
              <div class="text-xl lg:text-2xl font-grotesk font-bold text-primary">99.9%</div>
              <div class="text-xs text-muted mt-1">Uptime Reliability</div>
            </div>
            <div>
              <div class="text-xl lg:text-2xl font-grotesk font-bold text-primary">$2.4M+</div>
              <div class="text-xs text-muted mt-1">Saved For Clients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
