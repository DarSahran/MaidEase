# MaidEasy RAG Backend

## Structure
- `api/rag.js`: Main serverless RAG endpoint (Vercel/Upstash/Gemini)
- `api/docs.js`: App documentation/context for RAG
- `package.json`: Only keep dependencies for serverless (axios, @upstash/redis, etc.)
- `.env`: Store API keys (not committed)

## Remove/Ignore
- Remove `index.js` (legacy Express, not used)
- Remove `docs.txt` (if present)
- Ignore `node_modules`, `.env`, `.vercel`

## What to Commit to GitHub
- `api/rag.js`
- `api/docs.js`
- `package.json` (and lock file)
- `README.md`
- `.gitignore` (should ignore node_modules, .env, .vercel)

## Deployment
- Deploy only the `api` folder (Vercel serverless)
- Set environment variables in Vercel dashboard

---

**Do not commit `.env`, `node_modules`, or `.vercel` to GitHub.**
