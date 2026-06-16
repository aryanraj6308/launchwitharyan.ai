# LaunchWithAryan — Project Context

## Stack
- **Frontend**: Astro 6, React components, Tailwind CSS v3, port 4321
- **Backend**: FastAPI (Python), uvicorn, port 8000
- **AI**: Groq (primary), OpenAI (fallback), Ollama (local fallback)
- **Database**: SQLite (default), PostgreSQL ready
- **Auth**: JWT-based, admin: aryan@launchwitharyan.ai / AryanAdmin@2026!

## Running Servers
```cmd
# Start all
cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
cd frontend && npm run dev
```

## Chatbot Architecture
Frontend -> POST /api/ai/chat (FastAPI) -> routing:
  if ENABLE_FLOWISE=True -> Flowise proxy at POST /api/ai/flowise-chat
  else -> Groq (via langchain ChatGroq), fallback OpenAI, fallback Ollama

## Enabling Flowise (Docker — Recommended)
1. `docker pull flowiseai/flowise`
2. `docker run -d --name flowise -p 3000:3000 flowiseai/flowise`
3. Open http://localhost:3000, add Groq API key as ChatGroq credential
4. Import `backend/flowise/chatflow-blueprint.json` into Flowise canvas
5. Copy chatflow ID from URL, set in `backend/.env`:
   ```
   ENABLE_FLOWISE=true
   FLOWISE_API_URL=http://localhost:3000
   FLOWISE_CHATFLOW_ID=<id-from-flowise>
   ```
6. Restart backend

## Key Files
- `backend/app/routers/knowledge_ai.py` — AI routing logic
- `backend/app/routers/flowise_proxy.py` — Flowise proxy endpoint
- `backend/flowise/chatflow-blueprint.json` — Import-ready Flowise flow
- `frontend/src/components/ChatbotAI.astro` — Chatbot UI component
- `backend/.env` — Environment variables
- `backend/app/config.py` — App configuration

## Notes
- Flowise npm install is slow on Windows (~10+ min). Use Docker instead.
- Frontend access: http://localhost:4321
- Backend API: http://localhost:8000/docs (Swagger)
- Admin dashboard: http://localhost:4321/dashboard
