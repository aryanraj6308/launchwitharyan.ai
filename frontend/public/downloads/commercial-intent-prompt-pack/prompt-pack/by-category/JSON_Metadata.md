# JSON Metadata

*4 prompts in this category*

---

## #04 — JSON Metadata Generator

**Tags:** schema, metadata, export  
**Model:** GPT-4 / Claude  
**Description:** Generates structured JSON metadata for any blog post including schema.org markup.

```
After writing any blog post, always append the following JSON block:

```json
{
  "title": "[POST_TITLE]",
  "slug": "[url-friendly-slug]",
  "metaTitle": "[60 char max]",
  "metaDescription": "[155 char max]",
  "primaryKeyword": "[KW]",
  "secondaryKeywords": ["kw1", "kw2"],
  "targetWordCount": 0,
  "readingLevel": "Grade X",
  "contentType": "[buyers-guide|listicle|how-to|comparison]",
  "intent": "[informational|commercial|transactional]",
  "schema": "Article",
  "publishStatus": "draft",
  "internalLinks": [],
  "suggestedFAQs": []
}
```

Fill all fields accurately. Never guess word count — calculate it.
```

---

## #24 — Meta Title & Description Generator

**Tags:** meta, SERP, CTR  
**Model:** GPT-4 / Claude  
**Description:** Generates 5 title/description variants per post optimized for SERP CTR.

```
Generate 5 title and meta description variants for the following blog post, optimized for SERP click-through rate.

RULES:
- Title: max 60 characters, include primary keyword.
- Meta description: max 155 characters, include keyword and a clear value proposition.
- Vary each by angle: curiosity, benefit, urgency, number-driven, question.
- Output as JSON array:
[
  {"title": "...", "metaDesc": "...", "angle": "curiosity", "charTitle": N, "charDesc": N},
  ...
]
- Flag any title over 60 chars with a warning.

Post topic: [TOPIC] | Primary KW: [KW] | Key benefit: [BENEFIT]
```

---

## #31 — Schema Markup Generator

**Tags:** schema.org, structured-data, rich-results  
**Model:** GPT-4 / Claude  
**Description:** Generates schema.org JSON-LD markup for blog posts, FAQs, and how-tos.

```
Generate complete schema.org JSON-LD markup for the following blog post.

SCHEMA TYPES TO INCLUDE (as applicable):
1. Article (always)
2. FAQPage (if FAQ section exists)
3. HowTo (if tutorial/steps exist)
4. BreadcrumbList
5. Author (Person)

RULES:
- Output valid, minifiable JSON-LD.
- Use placeholder tokens for dynamic fields: {{POST_URL}}, {{PUBLISH_DATE}}, {{AUTHOR_NAME}}.
- Include 'dateModified' field.
- FAQ schema: pull exact Q&A pairs from the post content.
- HowTo schema: pull exact step names and descriptions.

Post content: [CONTENT] | Site URL: [SITE_URL] | Author: [AUTHOR]
```

---

## #50 — Full Blog Post + JSON Package

**Tags:** full-package, JSON, complete  
**Model:** GPT-4 / Claude  
**Description:** End-to-end prompt: writes the full post AND outputs complete JSON metadata package.

```
Write a complete, publish-ready blog post AND output the full JSON metadata package.

STEP 1 — OUTLINE (output first for approval):
[Markdown outline with H1-H3 hierarchy]

STEP 2 — FULL POST:
[Complete blog post following the outline]

STEP 3 — JSON PACKAGE:
```json
{
  "postMeta": {"title": "", "slug": "", "metaTitle": "", "metaDesc": "", "primaryKW": "", "secondaryKWs": [], "wordCount": 0, "readingLevel": "", "intent": ""},
  "seoMeta": {"schemaTypes": [], "faqSchema": [], "internalLinkOpportunities": []},
  "contentMeta": {"ctaCount": 0, "ctaText": [], "keyStats": [], "factCheckItems": []},
  "publishChecklist": {"hallucinations": "checked", "ctaPresent": true, "metaComplete": true}
}
```

GUARDRAILS: All hallucination rules apply. Fill wordCount by counting, not estimating.
Topic: [TOPIC] | KW: [KW] | Word count: [WC]
```

---

