import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

interface NavItem { name: string; href: string; }

const navItems: NavItem[] = [
  { name: 'Services', href: '/services' },
  { name: 'AI Store', href: '/store' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'dark';
    setTheme(stored);
    document.documentElement.setAttribute('data-theme', stored);
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
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-3 glass' : 'py-5 bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <a href="/" class="flex items-center gap-2 group shrink-0" aria-label="LaunchWithAryan AI Home">
            <img src="/logo.svg" alt="LaunchWithAryan AI" class="h-9 w-auto" />
          </a>

          <div class="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                class="font-sans text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4 rounded-sm"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div class="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              class="p-2.5 rounded-full transition-all duration-300 cursor-pointer glass text-theme-secondary hover:text-gold hover:border-gold/30 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun class="w-4 h-4" /> : <Moon class="w-4 h-4" />}
            </button>
            <a href="/contact" class="btn-primary text-sm">
              Start Project
            </a>
          </div>

          <div class="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              class="p-2 text-theme-secondary hover:text-gold transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold rounded-sm"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun class="w-5 h-5" /> : <Moon class="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              class="p-2 text-theme-secondary hover:text-gold transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold rounded-sm"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        class={`md:hidden fixed inset-x-0 top-0 bottom-0 z-[-1] transition-all duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          class={`absolute top-full left-0 right-0 glass transition-all duration-400 origin-top ${
            isOpen ? 'max-h-[80vh] py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div class="px-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                class="block font-sans text-base font-medium text-theme-secondary hover:text-gold py-3 px-3 rounded-lg hover:bg-gold/5 transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
            <div class="pt-4 px-3">
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
