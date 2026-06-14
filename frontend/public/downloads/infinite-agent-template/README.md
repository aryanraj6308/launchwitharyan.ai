# InfiniteAgent — Premium Landing Page Template

A production-ready landing page template built with **Astro 5.0** and **React 18**, designed for SaaS, AI products, and startups. Dark-themed, high-conversion layout with smooth animations, responsive design, and SEO optimization.

![Preview](https://placehold.co/1200x630/0b0e14/ffc71a?text=InfiniteAgent+Template)

---

## ✨ Features

- **Astro 5.0 + React 18** — hybrid rendering with island architecture for maximum performance
- **Tailwind CSS v4** — utility-first styling with a custom dark theme (gold & teal palette)
- **GSAP** — production-grade text reveal and scroll animations on the hero section
- **Framer Motion 11** — staggered card animations, scroll-triggered reveals, accordion transitions
- **Glassmorphism UI** — premium frosted-glass components with backdrop blur
- **Fully responsive** — optimized for mobile, tablet, and desktop breakpoints
- **SEO-ready** — Open Graph, Twitter Cards, JSON-LD structured data, canonical URLs
- **Accessible** — semantic HTML, aria attributes, keyboard-navigable accordion
- **TypeScript** — strict mode with path aliases

### Sections included

| Section        | File                        | Description                                    |
| -------------- | --------------------------- | ---------------------------------------------- |
| Hero           | `src/components/Hero.tsx`   | GSAP text reveal, animated gradient bg, CTA    |
| Features       | `src/components/Features.tsx` | 6-card grid with stagger Framer Motion entries |
| Testimonials   | `src/components/Testimonials.tsx` | Star ratings, scroll-triggered cards       |
| Pricing        | `src/components/Pricing.tsx` | Monthly/yearly toggle, 3 tiers, popular badge  |
| FAQ            | `src/components/FAQ.tsx`     | AnimatePresence accordion with smooth height    |
| CTA            | `src/components/CTA.tsx`     | Gradient urgency section with final action      |
| Footer         | `src/pages/index.astro`      | 4-column link grid, social icons, copyright     |

---

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10 (or **pnpm** >= 9 / **yarn** >= 4)

---

## 🚀 Quick Start

```bash
# 1. Navigate into the template directory
cd infinite-agent-template

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser. The site hot-reloads as you edit files.

---

## 📁 Project Structure

```
infinite-agent-template/
├── public/                     # Static assets (images, fonts, favicon)
│   └── og-default.png          # Default Open Graph image
├── src/
│   ├── components/             # React components (.tsx)
│   │   ├── Hero.tsx            # Hero section with GSAP
│   │   ├── Features.tsx        # Feature cards grid
│   │   ├── Testimonials.tsx    # Testimonial cards
│   │   ├── Pricing.tsx         # Pricing plans with toggle
│   │   ├── FAQ.tsx             # Accordion FAQ
│   │   └── CTA.tsx             # Call-to-action section
│   ├── layouts/
│   │   └── Layout.astro        # SEO-optimized HTML shell
│   ├── pages/
│   │   └── index.astro         # Home page — assembles all sections
│   └── styles/
│       └── global.css          # Tailwind v4 theme, components, utilities
├── .env.example                # Environment variable template
├── astro.config.mjs            # Astro configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # You are here
```

---

## 🎨 Customization Guide

### Colors

Edit the `@theme` block in `src/styles/global.css`. The brand colors are:

| Variable              | Default | Usage               |
| --------------------- | ------- | ------------------- |
| `--color-gold-*`      | Gold    | Primary accent       |
| `--color-teal-*`      | Teal    | Secondary accent     |
| `--color-surface`     | Dark    | Page background      |
| `--color-text-primary`| White   | Headings & body text |

### Fonts

Defaults are **Inter** (body) and **Space Grotesk** (display). Swap the Google Fonts link in `src/layouts/Layout.astro` and update the `--font-sans` / `--font-display` variables in `global.css`.

### Content

All copy lives directly in the components. To change:

- **Headline** — edit the `words` array in `src/components/Hero.tsx`
- **Feature cards** — edit the `features` array in `src/components/Features.tsx`
- **Testimonials** — edit the `testimonials` array in `src/components/Testimonials.tsx`
- **Pricing** — edit the `plans` array in `src/components/Pricing.tsx`
- **FAQ** — edit the `faqs` array in `src/components/FAQ.tsx`
- **Nav & Footer links** — edit `src/pages/index.astro`

### Meta & SEO

Edit the `title` and `description` props passed to `<Layout>` in `src/pages/index.astro`. Default Open Graph image is `public/og-default.png` — replace with your own 1200×630 image.

---

## 🧪 Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start dev server at localhost:4321     |
| `npm run build`   | Build to `dist/` (static site)         |
| `npm run preview` | Preview the production build locally   |
| `npm run astro`   | Run the Astro CLI (add, check, etc.)   |

---

## 🌐 Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Cloudflare Pages / Any static host

```bash
npm run build
# Deploy the dist/ folder to your host
```

---

## 🧰 Tech Stack

| Technology       | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| Astro            | ^5.0    | Static site generation       |
| React            | ^18     | Interactive UI components    |
| TypeScript       | ^5      | Type safety                  |
| Tailwind CSS     | ^4      | Utility-first styling        |
| Framer Motion    | ^11     | Component animations         |
| GSAP             | ^3      | High-performance GSAP anims  |
| @astrojs/react   | ^4      | React integration for Astro  |
| @astrojs/tailwind| ^6      | Tailwind integration         |

---

## 📄 License

This template is licensed for **commercial use**. You may use it for unlimited personal and commercial projects. Redistribution or resale of the template itself is not permitted.

---

Built with ❤️ by [InfiniteAgent](https://infiniteagent.com)
