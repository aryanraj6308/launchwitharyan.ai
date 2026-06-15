import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.database import KnowledgeBase
from app.config import settings

logger = logging.getLogger("aryanforge.knowledge")

KNOWLEDGE_SEED_DATA = [
    # ── Services ──
    {"category": "service", "title": "AI Workflow Automation Service", "priority": 10,
     "tags": "automation,ai,workflow,leads,crm,support",
     "content": """AryanForge builds custom AI automation systems that handle lead generation,
customer support, CRM updates, reporting, and repetitive operations. We design, build, and deploy
autonomous AI agents that connect your tools and automate your operations 24/7.
Process: Discovery Audit → Architecture Design → Agent Development → Integration → Optimization.
Result: 10x faster workflows, 60% cost reduction, 85% faster lead response, 70% ticket automation.
Typical ROI within 60-90 days. Monthly savings $5,000-$25,000."""},

    {"category": "service", "title": "Premium Web Platform Development", "priority": 10,
     "tags": "website,web development,astro,react,nextjs,seo",
     "content": """We build high-performance websites using Astro, React, and Next.js.
Features: sub-100ms load times, SEO-optimized, WCAG AA accessible, responsive design,
conversion-optimized, modern stack (Astro, React, Tailwind, Framer Motion, GSAP).
CMS integration: Sanity, Strapi, WordPress, or headless CMS.
Process: SEO Audit → Keyword Strategy → Content Engine → Technical Fixes → Monitor & Grow.
Results: 300% traffic growth, 850+ keywords ranked, 10x content output, 40% conversion uplift.
Standard 5-page site: 2-3 weeks. Complex platforms: 4-8 weeks."""},

    {"category": "service", "title": "AI Chatbot Development", "priority": 10,
     "tags": "chatbot,ai chat,conversational ai,customer support,lead generation",
     "content": """We build intelligent AI chatbots for customer support, lead qualification,
and business inquiries. Types: Customer Support Bots, Lead Qualification Bots, AI Sales Agents,
Multi-Agent Systems. Platforms: WhatsApp, Website Web Chat, Telegram, Slack.
Features: 24/7 availability, instant responses, multi-language support, context-aware conversations,
human handoff when needed. Pricing starts at $2,499 for a basic chatbot.
Complex multi-agent systems range from $5,000-$15,000.
Setup: Basic bot in 1-2 weeks, complex systems in 3-5 weeks."""},

    {"category": "service", "title": "SEO Automation Engine", "priority": 10,
     "tags": "seo,search engine optimization,content automation,keywords",
     "content": """Our AI-powered SEO automation service handles technical SEO, content generation,
keyword strategy, and performance monitoring. Features: AI keyword research and clustering,
automated content generation, technical SEO fixes, Core Web Vitals optimization,
SERP tracking and reporting. Process: SEO Audit → Keyword Strategy → Content Engine →
Technical Fixes → Monitor & Grow. Results: 300% average traffic increase, 850+ keywords in top 10,
10x content output without extra headcount."""},

    # ── Pricing ──
    {"category": "pricing", "title": "AI Chatbot Pricing", "priority": 9,
     "tags": "pricing,cost,chatbot,ai bot",
     "content": """AI Chatbot pricing starts at $2,499 (₹2,09,000) for a basic single-purpose chatbot
with web integration. Standard chatbot with lead qualification starts at $4,999 (₹4,19,000).
Enterprise multi-agent systems range from $9,999-$19,999 (₹8,39,000-₹16,79,000).
Maintenance plans available from $199/month. All plans include 30-day support post-launch."""},

    {"category": "pricing", "title": "Web Development Pricing", "priority": 9,
     "tags": "pricing,cost,website,web development",
     "content": """Premium Web Platform pricing: Standard 5-page business site: $3,999 (₹3,35,000).
10-page site with CMS: $6,999 (₹5,87,000). Custom web application/platform: $9,999+ (₹8,39,000+).
E-commerce site: $7,999-$14,999 (₹6,71,000-₹12,59,000). All include SEO optimization,
responsive design, accessibility compliance, and performance optimization.
Monthly maintenance: $149/month."""},

    {"category": "pricing", "title": "AI Automation Pricing", "priority": 9,
     "tags": "pricing,cost,automation,workflow",
     "content": """AI Workflow Automation: Single workflow automation: $2,999 (₹2,51,000).
Multi-workflow system (3-5 automations): $7,999 (₹6,71,000). Enterprise automation suite:
$14,999+ (₹12,59,000+). Includes discovery audit, development, integration, and 30-day optimization.
Monthly retainer for ongoing management: $299/month."""},

    {"category": "pricing", "title": "Digital Products Pricing", "priority": 9,
     "tags": "pricing,cost,templates,prompts,boilerplate",
     "content": """Digital Products available in our store:
- Infinite Agent Astro Template: ₹999 ($12) - Premium Astro website template
- RAG Conversational Boilerplate: ₹1,499 ($18) - RAG chatbot starter kit
- Commercial Intent Prompt Pack: ₹299 ($4) - 45 high-converting sales prompts
- Lead Ingestion Automation Kit: ₹699 ($8) - Lead capture automation pipeline"""},

    # ── Portfolio / Case Studies ──
    {"category": "portfolio", "title": "AI Automation Portfolio", "priority": 8,
     "tags": "portfolio,case study,results,clients",
     "content": """Featured Projects:
1. E-commerce Lead Automation: Built AI agent that qualifies 200+ leads/day, 40% conversion rate.
2. Real Estate Support Bot: 24/7 chatbot handling 85% of inquiries, human handoff for complex cases.
3. SaaS Dashboard Analytics: Automated reporting system saving 20 hrs/week per client.
4. Healthcare Appointment System: AI scheduler reducing no-shows by 60%."""},

    {"category": "portfolio", "title": "Web Development Portfolio", "priority": 8,
     "tags": "portfolio,websites,case study",
     "content": """Premium websites delivered:
- SaaS Landing Page: 98 Lighthouse score, 3x conversion rate improvement.
- E-commerce Platform: 500ms load time, 250% revenue increase in 6 months.
- Corporate Site: WCAG AA accessible, 45% increase in qualified leads.
- Portfolio/Agency Site: Custom animations with GSAP + Framer Motion."""},

    # ── FAQ ──
    {"category": "faq", "title": "How long does it take to build a chatbot?", "priority": 8,
     "tags": "faq,timeline,chatbot,setup",
     "content": "Basic chatbot: 1-2 weeks. Standard with lead qualification: 2-3 weeks. Complex multi-agent system: 3-5 weeks depending on integration depth."},

    {"category": "faq", "title": "Do I need technical knowledge to manage AI automations?", "priority": 8,
     "tags": "faq,technical,management",
     "content": "No. You get a dashboard to monitor performance. We handle all setup, maintenance, and tuning."},

    {"category": "faq", "title": "What platforms do you integrate with?", "priority": 8,
     "tags": "faq,integrations,platforms,tools",
     "content": "50+ tools including HubSpot, Salesforce, Slack, Gmail, WhatsApp, Zapier, Notion, Stripe, Shopify, and custom REST/SOAP APIs."},

    {"category": "faq", "title": "Is my data secure?", "priority": 8,
     "tags": "faq,security,data",
     "content": "Yes. All data is encrypted in transit and at rest. We implement 7-layer security including SSTI/SQLi/LPDOS protection, HMAC-signed webhooks, rate limiting, and prompt injection protection."},

    {"category": "faq", "title": "What is the ROI timeline for AI automation?", "priority": 8,
     "tags": "faq,roi,results,automation",
     "content": "Most clients see full ROI within 60-90 days. Typical monthly savings range from $5,000 to $25,000 depending on automation scope."},

    # ── Technology Stack ──
    {"category": "tech", "title": "Frontend Technologies", "priority": 7,
     "tags": "tech,frontend,react,astro,tailwind,gsap,framer",
     "content": "Astro, React 19, TypeScript, Tailwind CSS 4, Framer Motion, GSAP, Lucide Icons, Three.js."},

    {"category": "tech", "title": "Backend Technologies", "priority": 7,
     "tags": "tech,backend,python,fastapi,openai,langchain",
     "content": "Python FastAPI, PostgreSQL/SQLite, Redis, OpenAI GPT-4o-mini, LangChain, Ollama, Groq, JWT auth, SQLAlchemy, Razorpay."},

    {"category": "tech", "title": "AI & ML Stack", "priority": 7,
     "tags": "tech,ai,machine learning,llm,rag,embedding",
     "content": "OpenAI GPT-4o-mini, GPT-4o, Groq Llama 3.3, Ollama (local), LangChain, RAG pipelines, Vector embeddings, Prompt engineering, Fine-tuning."},

    # ── Policies ──
    {"category": "policy", "title": "Refund Policy", "priority": 8,
     "tags": "refund,policy,cancellation",
     "content": """Custom development projects: 50% refundable before development begins.
After development starts, no refund on work completed. Digital products (store):
All sales final due to digital nature. Subscription services: cancel anytime,
billed month-to-month with no long-term contract. Satisfaction guaranteed on all
custom projects — we work with you until you're happy with the deliverable."""},

    {"category": "policy", "title": "Support Policy", "priority": 7,
     "tags": "support,maintenance,uptime",
     "content": "All custom projects include 30 days post-launch support for bug fixes. Premium maintenance plans available from $149/month include: 24/7 monitoring, security updates, performance optimization, content updates, priority email support. Enterprise plans include 24/7 phone support and 1-hour response time SLA."},

    # ── Founder Contact ──
    {"category": "contact", "title": "Founder Contact Info", "priority": 10,
     "tags": "contact,aryan,founder,phone,email,whatsapp",
     "content": "The founder of AryanForge is Aryan. You can reach him directly at aryan@launchwitharyan.ai or via WhatsApp at +91 8877390736. He personally handles all client consultations and is available for discovery calls via Calendly."},
]


def seed_knowledge_base(db: Session):
    """Seed the knowledge base with initial data if empty."""
    count = db.query(KnowledgeBase).count()
    if count > 0:
        logger.info(f"Knowledge base already has {count} entries, skipping seed.")
        return
    logger.info(f"Seeding knowledge base with {len(KNOWLEDGE_SEED_DATA)} entries...")
    for entry in KNOWLEDGE_SEED_DATA:
        kb = KnowledgeBase(**entry)
        db.add(kb)
    db.commit()
    logger.info("Knowledge base seeded successfully.")


def query_knowledge_base(query: str, db: Session, top_k: int = 3) -> list[dict]:
    """Simple keyword-based knowledge retrieval. In production, replace with vector search."""
    query_lower = query.lower()
    words = set(query_lower.split())

    results = db.query(KnowledgeBase).filter(KnowledgeBase.is_active == True).all()
    scored = []

    for entry in results:
        score = 0
        content_lower = (entry.title + " " + entry.content + " " + (entry.tags or "")).lower()

        # Score by keyword matches
        for word in words:
            if len(word) < 3:
                continue
            if word in content_lower:
                score += 2
            if entry.tags and word in entry.tags.lower():
                score += 3

        # Boost priority
        score += entry.priority * 0.5

        if score > 0:
            scored.append((score, {
                "category": entry.category,
                "title": entry.title,
                "content": entry.content,
                "tags": entry.tags,
            }))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:top_k]]
