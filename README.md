# LaunchWithAryan AI — Agency Website

A production-grade, premium AI agency website engineered with a modern Astro + FastAPI architecture. Designed to look and feel like a startup-level product comparable to Linear, Stripe, and Vercel.

---

## 🚀 Stack Overview

| Layer | Technology |
|---|---|
| **Frontend** | Astro 6, React 19, Tailwind CSS v4, TypeScript |
| **3D / Motion** | Three.js, Framer Motion, GSAP |
| **Backend** | FastAPI (Python), SQLAlchemy |
| **Database** | PostgreSQL via Supabase |
| **Auth** | JWT (python-jose + passlib) |
| **Payments** | Razorpay SDK |
| **AI** | OpenAI API + local Ollama fallback |
| **Hosting** | Vercel (frontend) / Railway / Fly.io (backend) |

---

## 📁 Project Structure

```
launchwitharyan/
├── frontend/          # Astro + React + Tailwind frontend
│   ├── src/
│   │   ├── components/   # Hero, Navbar, Chatbot, Store, Dashboard ...
│   │   ├── layouts/      # Layout.astro (SEO, Meta, JSON-LD)
│   │   ├── pages/        # index, services, store, portfolio, blog, contact, pricing, dashboard
│   │   └── styles/       # global.css — Tailwind v4 theme tokens
│   └── astro.config.mjs
└── backend/           # FastAPI REST API
    ├── app/
    │   ├── routers/   # auth, ai, payments, contact, analytics
    │   ├── main.py    # App init, CORS, rate limiter
    │   ├── database.py
    │   ├── schemas.py
    │   └── config.py
    └── requirements.txt
```

---

## ⚡ Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:4321
```

### Backend
```bash
cd backend
cp .env.example .env       # Fill in your secrets
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend API docs → http://localhost:8000/api/docs

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `SECRET_KEY` | Random 256-bit JWT signing key |
| `RAZORPAY_KEY_ID` | Razorpay dashboard key (test mode) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `OPENAI_API_KEY` | OpenAI key (optional — falls back to Ollama) |
| `OLLAMA_URL` | Local Ollama URL (default: http://localhost:11434) |

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Premium landing page with 3D hero |
| `/services` | AI & web service catalog |
| `/store` | Digital templates & prompt packs store |
| `/portfolio` | Case study showcase |
| `/pricing` | Subscription tiers |
| `/blog` | SEO content hub |
| `/contact` | Lead capture + Calendly booking |
| `/dashboard` | Authenticated user console |

---

## 🔒 Security

- JWT auth on all dashboard routes
- Rate limiting via SlowAPI (20 req/min on AI, 50 on auth)
- CORS restricted to configured origins
- HMAC-SHA256 signature verification on Razorpay webhooks
- Passwords hashed with bcrypt

---

Built with ❤️ by **Aryan Raj** — LaunchWithAryan.AI
