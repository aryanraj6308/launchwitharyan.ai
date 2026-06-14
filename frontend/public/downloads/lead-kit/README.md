# Lead Ingestion Automation Kit

**Version:** 1.0 | **Price:** $39 | **Category:** Marketing Automation

## Overview

The Lead Ingestion Automation Kit provides production-ready webhook handlers (Node.js + Python) and integration modules for Google Sheets, Notion, and Slack. It receives form submissions, validates them, and routes leads to multiple destinations simultaneously.

## Architecture

```
                    ┌─────────────────┐
                    │  Form / Website  │
                    └────────┬────────┘
                             │ POST
                    ┌────────▼────────┐
                    │   Webhook URL   │
                    │ /api/ingest     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Validator     │
                    │  (Pydantic/JS)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Router (env)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
       │ Google      │ │  Notion  │ │  Slack      │
       │ Sheets      │ │  API     │ │  Webhook    │
       └─────────────┘ └──────────┘ └─────────────┘
              │              │              │
       ┌──────▼──────────────▼──────────────▼──────┐
       │              Queue (Redis)               │
       │        (optional, docker-compose)         │
       └───────────────────────────────────────────┘
```

## File Structure

```
lead-kit/
├── README.md
├── .env.example
├── docker-compose.yml
├── node-webhook/
│   ├── package.json
│   └── serverless.js
├── python-webhook/
│   ├── requirements.txt
│   └── handler.py
└── integrations/
    ├── sheets.py
    ├── notion.py
    └── slack.py
```

## Quick Start — Node.js (Vercel)

```bash
cd node-webhook
npm install
# Copy and configure environment
cp ../.env.example .env
# Edit .env with your API keys
npm start
```

Deploy to Vercel:
```bash
npm vercel --prod
```

## Quick Start — Python (FastAPI)

```bash
cd python-webhook
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your API keys
uvicorn handler:app --reload --port 8000
```

## Webhook URLs

After deployment, your webhook endpoint will be:

- **Node.js (Vercel):** `https://your-app.vercel.app/api/ingest`
- **Python (FastAPI):** `https://your-app.com/api/ingest`

### Testing with curl

```bash
curl -X POST https://your-app.vercel.app/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "Website Form",
    "message": "Interested in enterprise plan",
    "lead_score": 85
  }'
```

## Environment Variables

All configurable via `.env` file. See `.env.example` for full list.

## Integrations

### Google Sheets
- OAuth2 authentication via service account
- Automatically appends rows to your sheet
- Creates sheet if it doesn't exist
- Configurable via `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_NAME`

### Notion
- Creates database pages from lead submissions
- Maps form fields to Notion properties (title, rich_text, select, number, date, email, phone, url)
- Handles rate limiting with exponential backoff

### Slack
- Sends formatted message blocks to any channel
- Displays lead score with visual indicators
- Color-coded urgency levels
- Configurable channel via `SLACK_CHANNEL`

## Self-Hosted Deployment (Docker)

```bash
docker-compose up -d
```

This starts:
- **Webhook service** (FastAPI on port 8000)
- **Redis** for request queueing
- Auto-restart on failure

## Error Handling

- **Input validation:** Both handlers validate all fields before processing
- **Retry logic:** 3 retries with exponential backoff for destination delivery
- **Logging:** Structured JSON logging with request IDs
- **Graceful failures:** If one destination fails, others still receive the lead

## Testing

```bash
# Node.js
cd node-webhook && npm test

# Python
cd python-webhook && pytest
```

---

**Need support?** Open an issue or contact aryan@launchwitharyan.com
