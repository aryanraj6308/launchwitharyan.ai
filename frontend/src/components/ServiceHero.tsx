import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ServiceHeroProps {
  title: string;
  highlight: string;
  desc: string;
  badge?: string;
  children?: React.ReactNode;
}

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

export default function ServiceHero({ title, highlight, desc, badge, children }: ServiceHeroProps) {
  return (
    <section class="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 glow-hero-primary" />
        <div class="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 glow-hero-primary" />
        <div class="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-8 glow-hero-teal" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6 xl:col-span-5 space-y-8">
            {badge && (
              <motion.div {...fadeUp} transition={{ duration: 0.5 }} class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans text-gold bg-gold/10 border border-gold/20">
                <Sparkles class="w-3.5 h-3.5" />
                <span>{badge}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-grotesk font-bold tracking-tight leading-[1.1] text-theme-primary"
            >
              {title} <span class="gradient-gold">{highlight}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              class="text-lg sm:text-xl font-sans leading-relaxed max-w-xl text-theme-secondary"
            >
              {desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              class="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <a href="/contact" class="btn-primary text-base">
                Book a Free Call <ArrowRight class="w-4 h-4" />
              </a>
              <a href="/contact" class="btn-secondary text-base">
                Get Started
              </a>
            </motion.div>
          </div>

          <div class="lg:col-span-6 xl:col-span-7 relative">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
