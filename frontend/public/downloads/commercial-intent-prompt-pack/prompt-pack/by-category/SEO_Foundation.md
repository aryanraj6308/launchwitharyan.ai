# SEO Foundation

*14 prompts in this category*

---

## #01 — Core SEO Blog Writer

**Tags:** keyword, on-page, meta  
**Model:** GPT-4 / Claude  
**Description:** All-purpose SEO blog writer with keyword density, meta tag output, and header hierarchy.

```
You are an expert SEO content writer with 10+ years of experience writing high-ranking, conversion-focused blog posts for B2B and B2C brands.

RULES:
- Never fabricate statistics, case studies, or quotes. If you lack data, say so.
- Use the primary keyword in: H1, first 100 words, at least 2 H2s, and the meta description.
- Structure every post with: ## Introduction, ## [Subtopics], ## FAQ, ## Conclusion + CTA.
- Output a JSON metadata block at the end.
- Aim for Flesch-Kincaid Grade 8-10.
- Word count: [TARGET_WORDS]
- Primary keyword: [PRIMARY_KW]
- Secondary keywords: [SECONDARY_KWS]
```

---

## #09 — How-To Tutorial Post

**Tags:** how-to, tutorial, featured-snippet  
**Model:** GPT-4 / Claude  
**Description:** Step-by-step tutorial optimized for Google's featured snippet and PAA boxes.

```
Write a how-to tutorial blog post optimized to win Google's featured snippet position.

FEATURED SNIPPET RULES:
- Answer the 'how to [TOPIC]' question in 40-60 words immediately after the H1.
- Use numbered steps (1. 2. 3.) not bullet points.
- Each step: H3 heading → imperative verb → clear action → outcome.
- Include a 'What You'll Need' section before steps.
- Add a 'Common Mistakes' section after steps.

STRUCTURE ADDS: Time estimate, difficulty level, tools/requirements list.
Keyword: [KW] | Steps target: [N] steps
```

---

## #11 — Ultimate Guide / Pillar Page

**Tags:** pillar, long-form, authority  
**Model:** GPT-4 / Claude  
**Description:** Long-form authority pillar page (3000+ words) that clusters around a core topic.

```
You are writing a comprehensive pillar page — the definitive resource on this topic on the web.

RULES:
- Minimum 3000 words.
- Cover every sub-topic a reader might want to know.
- Include: Table of Contents (linked anchors), Key Takeaways box, multiple H2 sections, FAQ, Glossary of terms, Related Resources section.
- Each H2 should be answerable as a standalone featured snippet.
- Internal link opportunities: mark with [INTERNAL LINK: suggested anchor text].
- Tone: authoritative textbook, but readable.

Core topic: [TOPIC] | Primary KW: [KW] | Cluster keywords: [LIST]
```

---

## #12 — Local SEO Blog Post

**Tags:** local, geo-targeted, GMB  
**Model:** GPT-4 / Claude  
**Description:** Geo-targeted blog post with local intent signals for local SEO impact.

```
Write a locally-targeted blog post that ranks for '[SERVICE] in [CITY]' queries.

LOCAL SEO RULES:
- Use '[SERVICE] in [CITY]' or '[CITY] [SERVICE]' naturally 3-4 times.
- Include local landmarks, neighborhoods, or regional references where relevant.
- Add a 'Serving the [CITY] Area' section with nearby locations.
- Schema hint: LocalBusiness markup (note in JSON output).
- Mention any local regulations, costs, or seasonal considerations specific to [REGION].
- CTA: phone number placeholder, Google Maps embed suggestion, 'near me' anchor text.

Service: [SERVICE] | City: [CITY] | State/Region: [REGION]
```

---

## #13 — FAQ Cluster Post

**Tags:** FAQ, PAA, voice-search  
**Model:** GPT-4 / Claude  
**Description:** FAQ-format post targeting People Also Ask boxes and voice search queries.

```
Write a comprehensive FAQ blog post optimized for Google's 'People Also Ask' and voice search.

FORMAT RULES:
- Each FAQ: H3 question (question mark included) → 50-80 word direct answer → optional 1-2 sentence expansion.
- Questions must mirror natural language: 'How do I...', 'What is...', 'Can you...', 'Why does...'
- Include 15-20 questions minimum.
- Group questions into logical H2 sections.
- Answer the most important question in the first 100 words.
- JSON output: include 'faqSchema' array with question/answer pairs.

Topic: [TOPIC] | Primary KW: [KW]
```

---

## #19 — Statistics Roundup Post

**Tags:** statistics, data, backlinks  
**Model:** GPT-4 / Claude  
**Description:** Data-driven statistics roundup designed to earn backlinks and citations.

```
Write a statistics roundup blog post — a curated list of key stats on [TOPIC] designed to earn backlinks.

HALLUCINATION GUARDRAILS (CRITICAL):
- NEVER invent statistics. Every stat must come from the [DATA_INPUT] provided.
- If a statistic source is unknown, mark it [SOURCE UNKNOWN — remove before publishing].
- Format each stat as: Stat → Source → Year → What it means.
- Include a 'Methodology' note explaining how stats were collected/curated.

FORMAT:
- Group stats into thematic H2 sections.
- Each stat as a pull-quote formatted block.
- JSON output: include 'statistics' array with value, source, year, url.
Topic: [TOPIC] | Data: [DATA_INPUT]
```

---

## #21 — Programmatic SEO Template

**Tags:** programmatic, scalable, template  
**Model:** GPT-4 / Claude  
**Description:** Template-based prompt for generating 100s of location or category pages at scale.

```
You are generating content for a programmatic SEO page. You will receive variable inputs. Your job is to write natural, non-duplicate content using those variables.

INPUT VARIABLES:
- [CITY]
- [SERVICE]
- [PRICE_RANGE]
- [SEASON]

TEMPLATE RULES:
- Every page must feel unique — vary sentence structure, not just swap words.
- Do not repeat the same sentence with different variables.
- If a variable is empty, gracefully omit that section.
- Mark data-variable sentences clearly: {{VARIABLE_NAME}}
- Minimum: 300 words. Maximum: 600 words per page.

Output format: HTML-ready with proper H1, H2 tags included as markup.
```

---

## #23 — Internal Link Optimization Pass

**Tags:** internal-links, anchor-text, site-structure  
**Model:** GPT-4 / Claude  
**Description:** Reviews and suggests internal link placements within existing content.

```
Review the following blog post and optimize it for internal linking.

TASKS:
1. Identify 5-10 phrases that should become internal links.
2. Suggest the ideal anchor text for each.
3. Mark each in the text as: [LINK: suggested anchor text → suggested target page type]
4. Identify orphan content risks: sections with no obvious link targets.
5. Suggest 2-3 new internal links FROM other posts that should point TO this post.

GUARDRAILS:
- Never suggest linking to pages that don't logically exist.
- Prefer exact-match or partial-match anchor text over branded.
- Flag any over-optimization (same anchor used 3+ times).

Post content: [CONTENT]
```

---

## #25 — Content Refresh / Update Post

**Tags:** refresh, update, freshness  
**Model:** GPT-4 / Claude  
**Description:** Audits and rewrites outdated content for freshness and ranking recovery.

```
You are updating an existing blog post to improve its freshness score and regain rankings.

AUDIT TASKS:
1. Flag all dates older than 2 years: [OUTDATED: replace with current equivalent]
2. Flag statistics without a year: [STAT NEEDS DATE]
3. Identify sections that feel generic or padded — mark [THIN CONTENT: strengthen]
4. Suggest new H2 sections covering topics the original missed.
5. Update the introduction and conclusion to feel current.

PRESERVE:
- All existing internal links (mark their anchor text).
- The core thesis and keyword targeting.
- Any section that is still accurate and well-written.

Original post: [CONTENT] | Last updated: [DATE] | Target KW: [KW]
```

---

## #26 — Voice Search Optimized Post

**Tags:** voice, conversational, PAA  
**Model:** GPT-4 / Claude  
**Description:** Conversational content structured for voice search and smart speaker results.

```
Write a blog post optimized for voice search and conversational queries.

VOICE SEARCH RULES:
- Primary query phrasing: '[KW] near me' or 'how to [ACTION]' or 'what is [TERM]'
- Conversational tone — write as if you're speaking to someone.
- Use natural question-and-answer structure throughout.
- Every H2 should be a full question.
- Featured snippet target: answer each H2 in 60 words or fewer, starting with a direct answer.
- Avoid tables and complex lists — voice assistants can't read them well.

Target query: [QUERY] | Topic: [TOPIC]
```

---

## #27 — E-E-A-T Author Bio Builder

**Tags:** E-E-A-T, author, trust  
**Model:** GPT-4 / Claude  
**Description:** Generates structured author bios that satisfy Google's E-E-A-T requirements.

```
Write an E-E-A-T-optimized author bio for a blog post on [TOPIC].

E-E-A-T ELEMENTS TO INCLUDE:
- Experience: years in the field, hands-on work done.
- Expertise: credentials, certifications, publications.
- Authoritativeness: media mentions, speaking, recognitions.
- Trustworthiness: editorial standards, fact-checking process.

FORMAT:
- Short bio (50 words): for post footer.
- Long bio (150 words): for author page.
- Social proof bullets (3-5 one-liners for sidebar display).
- Schema output: 'author' JSON-LD block.

Only use information provided in [AUTHOR_DATA]. Mark any gaps as [NEEDS INFO].
Author data: [AUTHOR_DATA] | Topic niche: [NICHE]
```

---

## #30 — Competitor Gap Analysis Post

**Tags:** gap, competitive, SERP  
**Model:** GPT-4 / Claude  
**Description:** Identifies and fills topic gaps that competitors rank for but you don't.

```
Write a blog post that captures search traffic currently going to competitor content by covering their topic gaps and doing it better.

STRATEGY:
1. Open with the angle competitors miss (provided in [COMPETITOR_GAPS]).
2. Go 2x deeper on at least 3 subtopics.
3. Add unique value: original framework, analogy, checklist, or tool suggestion.
4. Better structure: more specific H2s, cleaner organization.
5. Faster answers: answer intent in first 100 words.

MARK opportunities: [BEATS COMPETITOR: how this section is better]

GUARDRAILS:
- Do not copy competitor content.
- All added claims must be factual or clearly framed as opinion.

Topic: [TOPIC] | Competitor gaps: [GAPS] | KW: [KW]
```

---

## #35 — Zero-Click Content Optimizer

**Tags:** zero-click, SERP, featured-snippet  
**Model:** GPT-4 / Claude  
**Description:** Optimizes content to win SERP features even in a zero-click environment.

```
Optimize this blog post for zero-click SERP features that build brand visibility even without the click.

FEATURES TO TARGET:
- Featured snippet: provide a 40-60 word definition or answer after the H1.
- People Also Ask: create H2/H3 questions matching PAA format.
- Knowledge panel: include clear entity definition and brand mentions.
- Rich results: mark FAQ, HowTo, and Article schema opportunities.

FOR EACH FEATURE:
- Mark in the content: [SNIPPET TARGET], [PAA TARGET], [SCHEMA: type].
- Explain what change enables that feature.

Rules: Do not write separate content — annotate the existing draft.

Draft: [CONTENT] | Target KW: [KW]
```

---

## #46 — Multilingual SEO Adapter

**Tags:** multilingual, hreflang, localization  
**Model:** GPT-4 / Claude  
**Description:** Adapts English blog posts for international markets with hreflang guidance.

```
Adapt the following English blog post for the [TARGET_LOCALE] market.

LOCALIZATION RULES:
- Translate naturally, not literally — idioms must be culturally appropriate.
- Replace US-specific examples with [TARGET_COUNTRY] equivalents.
- Adapt currency, units, date formats to local standard.
- Local keyword: [LOCAL_KW] — use in place of English primary KW.
- Adjust regulatory references for [COUNTRY] law.
- Mark any section needing local expert review: [LOCAL_REVIEW NEEDED].

TECHNICAL:
- Output hreflang tag suggestion for this locale.
- JSON: include 'locale', 'primaryKW', 'localKeyword', 'country' fields.

Source post: [CONTENT] | Target locale: [LOCALE] | Local KW: [LOCAL_KW]
```

---

