// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://aryanforge.com',
  base: '/',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = page.replace('https://aryanforge.com', '').replace(/\/$/, '');
        const exclude = ['/admin-dashboard', '/dashboard', '/login', '/405'];
        return !exclude.some(p => path === p || path.startsWith(p + '/'));
      },
      serialize: (entry) => {
        const path = entry.url.replace('https://aryanforge.com/', '').replace(/\/$/, '');
        const prio = path === '' ? 1.0 : path.startsWith('services') || path === 'pricing' ? 0.9 : path.startsWith('blog/') ? 0.7 : path === 'privacy' || path === 'terms' || path === 'dmca' ? 0.5 : 0.8;
        return { ...entry, changefreq: 'weekly', lastmod: new Date().toISOString(), priority: prio };
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  }
});