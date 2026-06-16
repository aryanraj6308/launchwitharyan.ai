# Conversion Copy

*11 prompts in this category*

---

## #08 — Listicle Conversion Post

**Tags:** listicle, clicks, engagement  
**Model:** GPT-4 / Claude  
**Description:** High-CTR listicle format with intro hooks, numbered entries, and embedded CTAs.

```
Write a conversion-optimized listicle blog post. Listicles must drive clicks AND conversions — not just traffic.

RULES:
- Title formula: [Number] [Adjective] [Things] That [Benefit]
- Each list item: Bold headline → 80-120 word explanation → micro-CTA or stat
- Embed 2 internal CTAs (not at the end only): one mid-post, one at conclusion.
- Use pattern interrupts: callout boxes, pro tips, warnings formatted in blockquotes.
- Avoid fluff — every sentence must earn its place.

Number of items: [N] | Keyword: [KW] | Audience: [AUDIENCE]
```

---

## #15 — Thought Leadership / Opinion Post

**Tags:** thought-leadership, brand, E-E-A-T  
**Model:** GPT-4 / Claude  
**Description:** Executive byline opinion post that builds brand authority and E-E-A-T signals.

```
Write a thought leadership article in the voice of [AUTHOR_TITLE] at [COMPANY].

STYLE RULES:
- First-person perspective based on professional experience.
- Open with a contrarian or surprising observation, not a definition.
- Make 3-5 bold, defensible claims with reasoning — not generic advice.
- Cite industry trends as 'in our experience' or 'what we're seeing' — do not fabricate data.
- Include a personal anecdote slot: [INSERT REAL ANECDOTE HERE].
- Close with a call to conversation, not a product pitch.

Tone: confident, direct, human. Not corporate-speak.
Topic: [TOPIC] | Author: [AUTHOR] | Brand: [BRAND]
```

---

## #17 — Case Study Blog Post

**Tags:** case-study, social-proof, BOFU  
**Model:** GPT-4 / Claude  
**Description:** Structured case study post with problem/solution/results framework.

```
Write a customer case study blog post following the Problem → Solution → Results framework.

STRUCTURE:
1. ## Executive Summary (TL;DR with headline metric)
2. ## The Challenge (customer's pain point before)
3. ## Why [COMPANY] (decision criteria)
4. ## The Solution (what was implemented)
5. ## Implementation (timeline, process)
6. ## Results (specific metrics — only include real provided data)
7. ## Key Takeaways
8. ## About [Customer]

GUARDRAILS:
- Only use metrics provided in [DATA_INPUT] — never invent percentages or numbers.
- If no result data is provided, use qualitative quotes instead.
- Mark all customer quotes with [QUOTE TO BE VERIFIED].

Customer: [CUSTOMER] | Product: [PRODUCT] | Data: [DATA_INPUT]
```

---

## #20 — Email Newsletter to Blog Adapter

**Tags:** repurpose, newsletter, email  
**Model:** GPT-4 / Claude  
**Description:** Converts email newsletters into SEO-optimized blog posts.

```
Convert the following email newsletter into an SEO-optimized blog post without losing the original voice.

CONVERSION RULES:
- Expand email brevity: each bullet point becomes a paragraph.
- Add a proper H1, H2 structure, and meta content.
- Insert keyword naturally where it fits the existing content — do not force it.
- Add an introduction and conclusion the email may lack.
- Preserve all opinions and claims exactly — do not paraphrase facts.
- Mark any claims that need verification: [VERIFY].
- Output JSON metadata block at the end.

Newsletter content: [EMAIL_CONTENT]
Target keyword: [KW]
```

---

## #22 — Persona-Targeted Blog Post

**Tags:** persona, targeting, segmentation  
**Model:** GPT-4 / Claude  
**Description:** Rewrites the same topic for different audience personas and buying stages.

```
Write [N] versions of a blog post on [TOPIC], each targeted to a different persona.

PERSONAS:
1. [PERSONA_1]: [describe role, pain points, goals]
2. [PERSONA_2]: [describe role, pain points, goals]
3. [PERSONA_3]: [describe role, pain points, goals]

PER-VERSION RULES:
- Same core information, different framing, vocabulary, and examples.
- Adjust reading level and jargon to the persona's expertise.
- Different CTA for each (what does this persona most want to do next?).
- JSON output: include 'persona' field in metadata.

Base topic: [TOPIC] | Core KW: [KW]
```

---

## #29 — Conversion Rate Optimization Post

**Tags:** CRO, landing, conversion  
**Model:** GPT-4 / Claude  
**Description:** Blog post written with CRO principles — structured to push readers to convert.

```
Write a blog post designed not just to rank, but to convert readers into leads or customers.

CRO WRITING RULES:
- AIDA structure: Attention → Interest → Desire → Action.
- Embed 3 strategically placed CTAs: intro, midpoint, conclusion.
- Each CTA should be different: free resource, demo, contact.
- Use social proof signals: mention customer types, outcomes, trust indicators.
- Address the 3 most common objections to [OFFER] within the content naturally.
- Power words: use sparingly and only where true.
- Never fabricate testimonials or results.

Topic: [TOPIC] | Offer: [OFFER] | Objections: [OBJECTION_1, 2, 3]
```

---

## #34 — SaaS Feature Announcement Post

**Tags:** SaaS, product, announcement  
**Model:** GPT-4 / Claude  
**Description:** Blog post announcing a new product feature with SEO and conversion goals.

```
Write a feature announcement blog post for [FEATURE] that also ranks for [KW].

STRUCTURE:
1. ## [Feature] Is Here: What This Means for [USER_TYPE]
2. ## The Problem We Solved (customer pain point)
3. ## How [Feature] Works (step-by-step, clear language)
4. ## Who Benefits Most (2-3 use cases)
5. ## How to Get Started (CTA to feature or docs)
6. ## FAQ

RULES:
- Lead with customer benefit, not engineering specs.
- Use 'you' language throughout.
- Avoid internal jargon — define any technical term on first use.
- Do not claim capabilities the feature doesn't have.

Feature: [FEATURE] | Product: [PRODUCT] | KW: [KW]
```

---

## #36 — Objection Handling Content

**Tags:** objections, trust, MOFU  
**Model:** GPT-4 / Claude  
**Description:** Mid-funnel content that proactively handles buyer objections to increase conversion.

```
Write a blog post that addresses common objections buyers have about [PRODUCT/SERVICE/CATEGORY].

STRUCTURE (for each objection):
- H2: State the objection as the reader would say it ('But isn't [X] too expensive?')
- Acknowledge the objection genuinely.
- Provide evidence-based reframe.
- Real-world example or social proof placeholder.
- Micro-CTA.

OBJECTIONS TO ADDRESS:
[OBJECTION_LIST]

GUARDRAILS:
- Never dismiss objections or be condescending.
- Do not fabricate testimonials — use [QUOTE: INSERT REAL TESTIMONIAL].
- Never make pricing claims — use [PRICING — check current rates].

Product: [PRODUCT] | KW: [KW]
```

---

## #39 — Repurpose to LinkedIn / Twitter Thread

**Tags:** repurpose, social, distribution  
**Model:** GPT-4 / Claude  
**Description:** Converts blog posts into LinkedIn articles or Twitter/X thread format.

```
Repurpose the following blog post into two formats:

FORMAT 1 — LinkedIn Article (600-800 words):
- Professional tone, first-person.
- Open with a strong hook (not the blog intro).
- Restructure for scan-reading (short paragraphs, line breaks).
- End with a question to drive comments.

FORMAT 2 — Twitter/X Thread (10-15 tweets):
- Tweet 1: Bold hook with numbers or surprise.
- Tweets 2-13: One insight per tweet, numbered.
- Final tweet: CTA + blog link placeholder.

GUARDRAILS:
- Preserve all factual claims exactly.
- No invented stats.
- Add '(1/N)' numbering to thread tweets.

Blog post: [CONTENT]
```

---

## #41 — Interview / Expert Quote Post

**Tags:** interview, expert, quote  
**Model:** GPT-4 / Claude  
**Description:** Structures expert interviews into SEO-optimized Q&A blog posts.

```
Format the following expert interview transcript into a polished, SEO-optimized Q&A blog post.

FORMATTING RULES:
- Bold the question, italic or regular for the answer.
- Group Q&As under H2 thematic sections.
- Pull 3-5 best quotes into callout blocks.
- Add an intro (100 words) and outro (100 words) in editorial voice — these are the only parts you write.
- Never paraphrase quotes — reproduce them exactly as given.
- Mark any unclear sections: [INAUDIBLE — confirm with speaker].

SEO ADDITIONS:
- Suggest 3 H2 section headings that match search queries.
- JSON output: include 'quotePullouts' array.

Transcript: [TRANSCRIPT] | Expert: [EXPERT_NAME] | KW: [KW]
```

---

## #48 — Conversion-Focused CTA Generator

**Tags:** CTA, button-copy, conversion  
**Model:** GPT-4 / Claude  
**Description:** Generates 10+ CTA variants for blog posts, ranked by conversion psychology.

```
Generate 15 call-to-action variants for the following offer, optimized for blog post conversion.

FOR EACH CTA PROVIDE:
- Button text (max 5 words)
- Supporting line (max 15 words)
- Psychological trigger used (urgency/curiosity/benefit/social proof/FOMO)
- Placement recommendation (intro/mid-post/exit)

FORMAT as JSON array:
[
  {"buttonText": "...", "supportingLine": "...", "trigger": "...", "placement": "..."}
]

GUARDRAILS:
- No false urgency ('limited time!' without actual limit).
- No manufactured scarcity.
- Button text must be action verbs.

Offer: [OFFER] | Audience: [AUDIENCE] | Goal: [GOAL]
```

---

