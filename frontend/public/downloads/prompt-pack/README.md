# Commercial Intent Prompt Pack

**Version:** 1.0 | **Price:** $19 | **Category:** SEO Content Generation

## Overview

The Commercial Intent Prompt Pack contains 50+ expertly crafted system prompts designed to generate high-converting SEO blog content at scale. Each prompt is battle-tested across GPT-4, Claude-3, and Gemini to ensure consistent output quality.

## What's Included

- `prompts/seo-blog-prompts.md` — Readable markdown with all 50+ prompts organized by category
- `prompts/prompts.json` — Same prompts in JSON format for programmatic use (APIs, automation pipelines, no-code tools)

## Recommended Models

| Model | Best For | Notes |
|-------|----------|-------|
| GPT-4 Turbo | Full article writing, Meta descriptions | Most consistent with structured outputs |
| Claude-3 Opus | Keyword research, Content strategy | Superior reasoning for strategic prompts |
| Claude-3 Sonnet | Blog outlines, FAQ schema | Best speed/quality ratio |
| Gemini 1.5 Pro | Content rewriting, Internal linking | Handles large context windows well |
| GPT-3.5 Turbo | Batch processing, Draft generation | Use only for high-volume, low-stakes tasks |

## Temperature Settings

| Task | Recommended Temp | Range |
|------|-----------------|-------|
| Keyword Research | 0.3 | 0.2–0.5 |
| Blog Outlines | 0.5 | 0.4–0.7 |
| Full Articles | 0.7 | 0.6–0.8 |
| Meta Descriptions | 0.2 | 0.1–0.4 |
| Content Rewriting | 0.4 | 0.3–0.6 |
| FAQ Schema | 0.3 | 0.2–0.5 |
| Internal Linking | 0.4 | 0.3–0.6 |

## Token Limits

| Task | Recommended Max Tokens |
|------|----------------------|
| Keyword Research | 2,000 |
| Blog Outline | 3,000 |
| Full Article (short) | 4,000 |
| Full Article (long) | 8,000 |
| Meta Description | 500 |
| Content Rewriting | 4,000 |
| FAQ Schema | 2,500 |
| Internal Linking | 2,000 |

## Prompt Engineering Tips

1. **Fill all `{variables}`** before sending — incomplete prompts produce scattered results.
2. **Set system role explicitly** — each prompt begins with a role definition. Keep this intact.
3. **Chain prompts** — use output from a Keyword Research prompt as input to the Outline prompt for best results.
4. **Iterate temperature** — if output is too creative, lower temperature by 0.1. If too repetitive, raise by 0.1.
5. **Use JSON mode** — when using the `prompts.json` file with GPT-4, enable JSON response format for structured parsing.
6. **Context window management** — for long articles, provide outline + introduction as context rather than the full draft.
7. **Few-shot examples** — the prompts include inline examples. For brand-specific tone, add 2–3 sample paragraphs before the prompt.

## Quick Start

```bash
# Using the JSON file with an API
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "system", "content": "'"$(jq -r '.[] | select(.id=="kw-01") | .prompt' prompts/prompts.json)"'"},
      {"role": "user", "content": "Generate keywords for a SaaS accounting tool"}
    ],
    "temperature": 0.3,
    "max_tokens": 2000
  }'
```

## License

This product is licensed for **commercial use**. You may use these prompts in client projects, internal tools, and SaaS products. Redistribution of the prompt collection as-is is prohibited.

---

**Need support?** Open an issue or contact aryan@launchwitharyan.com
