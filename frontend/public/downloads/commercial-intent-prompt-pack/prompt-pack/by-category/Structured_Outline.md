# Structured Outline

*7 prompts in this category*

---

## #06 — Markdown Outline Builder

**Tags:** outline, markdown, H-tags  
**Model:** GPT-4 / Claude  
**Description:** Generates a complete markdown outline with H1-H4 hierarchy before writing begins.

```
Before writing any blog post, first output a complete markdown outline using proper heading hierarchy.

FORMAT:
# H1 Title (include primary keyword)
## H2 Section 1
### H3 Subsection
#### H4 detail (if needed)
## H2 Section 2
...
## FAQ
## Conclusion

RULES:
- H1: exactly one per post, keyword in first 60 chars.
- H2s: 4-8 per post, each targeting a semantic variation of the keyword.
- H3s: supporting points, include LSI keywords.
- Mark estimated word count per section in [brackets].
- After approval, write the full post following this outline exactly.

Topic: [TOPIC] | Primary KW: [KW]
```

---

## #28 — Content Brief Generator

**Tags:** brief, strategy, planning  
**Model:** GPT-4 / Claude  
**Description:** Full content brief document for assigning to writers, with all SEO parameters.

```
Generate a detailed content brief for a writer to execute on the following topic.

BRIEF MUST INCLUDE:
1. Post goal (traffic? leads? sales?)
2. Target reader persona
3. Primary keyword + monthly volume placeholder
4. Secondary + LSI keywords
5. Recommended word count
6. Tone and style guide (3-5 rules)
7. Competitor posts to beat (mark as [MANUALLY ADD URLS])
8. Required sections with notes per section
9. Internal links to include
10. CTA instructions
11. Content guardrails (what NOT to say)
12. JSON metadata template to fill out

Output as a well-structured markdown document suitable for sharing with a writer.
Topic: [TOPIC] | KW: [KW] | Goal: [GOAL]
```

---

## #32 — Semantic SEO Cluster Planner

**Tags:** topic-cluster, pillar, siloing  
**Model:** GPT-4 / Claude  
**Description:** Plans a full topic cluster with pillar and spoke content mapped by intent.

```
Plan a topic cluster for [CORE_TOPIC] that will establish topical authority.

DELIVERABLES:
1. Pillar Page: title + H2 outline
2. 8-12 Spoke Articles: title, target KW, intent (info/commercial/transactional), recommended word count
3. Internal Link Map: which spokes link to pillar and to each other
4. Content Priority Order (quick wins first)

FORMAT: Markdown table for spoke articles.
JSON output: include 'cluster' object with all articles as an array.

GUARDRAILS:
- Every spoke must serve a distinct search intent.
- No keyword cannibalization (flag if two articles target same KW).

Core topic: [CORE_TOPIC] | Site niche: [NICHE]
```

---

## #38 — Topical Authority Audit

**Tags:** audit, gap, authority  
**Model:** GPT-4 / Claude  
**Description:** Audits existing content library to identify topical authority gaps.

```
Audit the following list of existing blog posts and identify topical authority gaps.

ANALYSIS TASKS:
1. Group posts by topic cluster.
2. Identify missing subtopics for each cluster.
3. Flag clusters where the pillar post is missing.
4. Identify keyword cannibalization risks (similar titles/KWs).
5. Suggest 10 new post ideas to fill the most critical gaps.

OUTPUT FORMAT:
- Markdown table of clusters + gaps.
- Prioritized list of recommended new posts.
- JSON: 'auditSummary' with clusters, gapCount, and priority scores.

Content list: [CONTENT_LIST] | Site niche: [NICHE]
```

---

## #43 — Checklist / Template Post

**Tags:** checklist, template, download  
**Model:** GPT-4 / Claude  
**Description:** Downloadable checklist blog post optimized for lead generation.

```
Write a blog post built around a practical checklist that readers will want to download or bookmark.

STRUCTURE:
1. ## Introduction: Why [TOPIC] Needs a Checklist (80 words)
2. ## The [N]-Point [TOPIC] Checklist (formatted as a markdown checkbox list)
3. ## How to Use This Checklist
4. ## Common Mistakes to Avoid
5. ## [TOPIC] Checklist: Quick Reference (condensed version for scanning)
6. ## Next Steps + Lead Gen CTA

FORMATTING: Use - [ ] checkbox syntax for all checklist items.
JSON output: include 'checklistItems' array with 'text' and 'category' per item.
Keyword: [KW] | Checklist topic: [TOPIC]
```

---

## #44 — Pillar Post Table of Contents

**Tags:** TOC, navigation, anchor  
**Model:** GPT-4 / Claude  
**Description:** Generates anchor-linked table of contents for long-form pillar content.

```
Generate a full table of contents for the following long-form pillar post with anchor link formatting.

FORMAT:
## Table of Contents
1. [Section Name](#anchor-slug)
2. [Section Name](#anchor-slug)
...

ANCHOR RULES:
- Slugify each H2/H3 title: lowercase, hyphens, no special chars.
- H2 = numbered in TOC; H3 = indented sub-items.
- Include estimated read time per section: (approx N min)
- Mark any section flagged [THIN CONTENT] from previous review.

JSON output: 'toc' array with {title, anchor, level, estimatedMinutes}.

Post outline/content: [CONTENT]
```

---

## #51 — Accessibility-First Blog Formatter

**Tags:** accessibility, a11y, UX  
**Model:** GPT-4 / Claude  
**Description:** Formats blog posts to meet WCAG accessibility standards for inclusive content.

```
Format and audit the following blog post for web accessibility compliance.

ACCESSIBILITY CHECKS:
1. Alt text: Mark every image location as [IMAGE: add descriptive alt text here].
2. Link text: Replace generic 'click here' with descriptive anchor text.
3. Reading level: Confirm or adjust to Grade 8 max.
4. Table accessibility: Add [CAPTION NEEDED] to all markdown tables.
5. Heading hierarchy: Verify no heading levels are skipped.
6. Color-blind safe: Remove any color-only meaning references.
7. Plain language: Flag jargon and suggest plain alternatives.

Output an ACCESSIBILITY REPORT at the end with pass/fail per criterion.

Content: [CONTENT]
```

---

