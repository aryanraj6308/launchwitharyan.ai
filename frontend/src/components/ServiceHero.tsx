import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ServiceHeroProps {
  title: string;
  highlight: string;
  desc: string;
  badge?: string;
  children?: React.ReactNode;
  ctaUrl?: string;
}

export default function ServiceHero({ title, highlight, desc, badge, children, ctaUrl = '/contact' }: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] bg-gold" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-secondary bg-raised border border-default"
              >
                <span>{badge}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-grotesk font-bold tracking-tight leading-[1.1] text-primary"
            >
              {title} <span className="gradient-gold">{highlight}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg leading-relaxed max-w-lg text-secondary"
            >
              {desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <a href={ctaUrl} className="btn-primary text-base inline-flex">
                Book a Free Call <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-7 xl:col-span-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
