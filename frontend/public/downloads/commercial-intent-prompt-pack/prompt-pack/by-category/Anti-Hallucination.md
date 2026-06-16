# Anti-Hallucination

*7 prompts in this category*

---

## #02 — Hallucination-Free Research Post

**Tags:** factual, citations, zero-hallucination  
**Model:** GPT-4 / Claude  
**Description:** Forces model to cite only known facts and flag uncertain claims with [VERIFY].

```
You are a factual content writer. Your #1 rule is accuracy over creativity.

HALLUCINATION GUARDRAILS:
- Mark any statistic you are unsure of as [VERIFY — source needed].
- Never invent named experts, studies, or brand case studies.
- Use hedging language ("research suggests," "industry estimates") when specific numbers are unavailable.
- If you cannot substantiate a claim, remove it entirely.
- At the end, output a FACT-CHECK LIST of every claim made.

Write a [WORD_COUNT]-word blog post on: [TOPIC]
```

---

## #33 — Anti-Fluff Editor Pass

**Tags:** editing, concise, quality  
**Model:** GPT-4 / Claude  
**Description:** Strips filler sentences, passive voice, and AI clichés from generated content.

```
Edit the following blog post draft to eliminate AI-generated fluff and weak writing.

FLUFF PATTERNS TO DELETE:
- 'In today's digital landscape'
- 'It's important to note that'
- 'In conclusion, it is clear that'
- 'As we have seen in this article'
- Any sentence that doesn't add information
- Any paragraph that restates the intro in different words

STRENGTHEN:
- Replace every passive voice sentence with active voice.
- Replace vague adjectives (great, amazing, effective) with specific ones.
- Cut word count by 15-20% while preserving all information.
- Flag any remaining weak sentences: [WEAK — strengthen this]

Draft: [CONTENT]
```

---

## #37 — Readability Optimizer

**Tags:** readability, UX, Flesch  
**Model:** GPT-4 / Claude  
**Description:** Rewrites content to hit a target Flesch-Kincaid readability score.

```
Rewrite the following content to hit a Flesch-Kincaid reading ease score of [TARGET_SCORE] (e.g., 60-70 = standard, 70-80 = easy).

METHODS:
- Shorten sentences (target: avg 17 words or fewer).
- Replace multi-syllable words with simpler equivalents.
- Break up paragraphs over 4 sentences.
- Use active voice throughout.
- Add subheadings every 200-300 words.
- Use contractions where natural.

DO NOT:
- Remove technical terms required for the topic.
- Change factual claims.
- Add or invent new information.

Estimate the reading grade level before and after.

Content: [CONTENT] | Target audience: [AUDIENCE]
```

---

## #45 — Negative Keyword Filter Prompt

**Tags:** filter, quality, guardrail  
**Model:** GPT-4 / Claude  
**Description:** Prevents AI from using brand, legal, or competitor terms that could cause issues.

```
You are a content filter. Apply the following guardrails to all content you generate:

NEVER USE THESE TERMS:
[BRAND_BLACKLIST] — competitor brand names, never mention
[LEGAL_TERMS] — terms legal team has flagged
[CLAIM_RESTRICTIONS] — claims not approved for use

NEVER DO THIS:
- Make specific ROI claims (e.g., 'save 50%') without [APPROVED_CLAIM] tag.
- Use superlatives (best, #1, fastest) without qualifying language.
- Name customer logos not in [APPROVED_LOGOS].
- Make regulatory or compliance claims without [LEGAL_APPROVED] marker.

Output a COMPLIANCE CHECK at the end of every post.

Brand blacklist: [BRANDS] | Legal terms: [LEGAL] | Claims: [CLAIMS]
```

---

## #47 — Paraphrase & Rewrite (Plagiarism Safe)

**Tags:** rewrite, originality, plagiarism  
**Model:** GPT-4 / Claude  
**Description:** Rewrites source material into 100% original content while preserving accuracy.

```
Rewrite the following source content as a completely original blog post that passes plagiarism detection.

REWRITE RULES:
- Change sentence structure, not just synonyms.
- Reorganize the information flow.
- Add your own connecting tissue and transitions.
- Use a different opening and closing.
- Never copy more than 5 consecutive words from the source.

GUARDRAILS:
- Preserve all factual claims exactly — accuracy > originality.
- Mark any claim you're uncertain about: [VERIFY — check source].
- Do not add information not in the source.
- Output a 'Changes Made' summary at the end.

Source: [SOURCE_CONTENT] | Target KW: [KW]
```

---

## #49 — Brand Voice Enforcer

**Tags:** brand-voice, tone, consistency  
**Model:** GPT-4 / Claude  
**Description:** Rewrites AI output to match a specific brand voice guide.

```
Rewrite the following content to match our brand voice precisely.

BRAND VOICE PARAMETERS:
- Tone: [TONE] (e.g., 'authoritative but approachable, like a trusted advisor')
- Vocabulary: PREFER [PREFERRED_WORDS] | AVOID [BANNED_WORDS]
- Sentence style: [STYLE] (e.g., short punchy sentences, or complex multi-clause)
- Personality traits: [TRAITS]
- What we never say: [NEVER_SAY]
- Example of on-brand writing: [EXAMPLE_PARAGRAPH]

RULES:
- Do not change facts, only presentation.
- Flag any section where voice guidance conflicts with clarity: [VOICE CONFLICT].
- Output a score (1-10) for how closely the rewrite matches the voice guide.

Content: [CONTENT] | Voice guide: [VOICE_GUIDE]
```

---

## #52 — AI Detection Humanizer

**Tags:** humanize, AI-detection, authenticity  
**Model:** GPT-4 / Claude  
**Description:** Rewrites AI-generated content to read authentically human and pass AI detection tools.

```
Rewrite the following AI-generated content to read naturally human while preserving all factual accuracy.

HUMANIZATION TECHNIQUES:
- Add natural sentence rhythm variation (short, medium, long).
- Include one genuine conversational aside per 300 words.
- Remove all AI-typical transitions: 'Furthermore', 'In addition', 'It is worth noting'.
- Add a mildly opinionated framing (not neutral-speak) where appropriate.
- Vary paragraph length — no uniform 3-sentence blocks.
- One intentionally informal sentence per section (where appropriate).

GUARDRAILS:
- Never add facts not in the original.
- Never change the author's stated opinion.
- Preserve all keyword placements within 10 words of original position.

Content: [CONTENT] | Target audience: [AUDIENCE]
```

---

