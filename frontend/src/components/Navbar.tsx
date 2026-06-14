import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

interface NavItem { name: string; href: string; }

const navItems: NavItem[] = [
  { name: 'Services', href: '/services' },
  { name: 'AI Store', href: '/store' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-theme-primary/85 backdrop-blur-xl border-b border-default' : 'py-5 bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <a href="/" class="flex items-center gap-3 shrink-0" aria-label="Home">
            <img src="/logo.svg" alt="Home" class="h-8 w-auto" loading="eager" decoding="async" />
          </a>

          <div class="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                class="px-3 py-2 text-sm font-medium text-secondary hover:text-primary rounded-lg hover:bg-raised transition-colors duration-150"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div class="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              class="p-2 rounded-lg text-secondary hover:text-primary hover:bg-raised transition-colors duration-150"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun class="w-4 h-4" /> : <Moon class="w-4 h-4" />}
            </button>
            <a href="/contact" class="btn-primary text-sm ml-2">
              Start Project
            </a>
          </div>

          <div class="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              class="p-2 text-secondary hover:text-primary transition-colors duration-150"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun class="w-5 h-5" /> : <Moon class="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              class="p-2 text-secondary hover:text-primary transition-colors duration-150"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X class="w-5 h-5" /> : <Menu class="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        class={`md:hidden fixed inset-x-0 top-0 bottom-0 z-[-1] transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          class={`absolute top-full left-0 right-0 bg-theme-primary border-b border-default transition-all duration-300 origin-top ${
            isOpen ? 'max-h-[80vh] py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div class="px-4 space-y-0.5">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                class="block text-sm font-medium text-secondary hover:text-primary py-2.5 px-3 rounded-lg hover:bg-raised transition-colors duration-150"
              >
                {item.name}
              </a>
            ))}
            <div class="pt-3 px-3">
              <a href="/contact" onClick={() => setIsOpen(false)} class="btn-primary w-full justify-center text-sm">
                Start Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
