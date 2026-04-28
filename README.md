# DevPulse

Production-ready monorepo for an AI-powered engineering intelligence SaaS platform.

## Monorepo Structure

```txt
DevPulse/
├── apps/
│   ├── web/      # Next.js 14 App Router + APIs + NextAuth
│   ├── worker/   # BullMQ workers
│   └── ws/       # WebSocket server (ws)
├── packages/
│   ├── db/       # Prisma schema, migration, seed, Prisma client
│   └── lib/      # Shared AI, Redis, queue, validation utilities
├── docker-compose.yml
└── .env.example
```

## Features Implemented

- NextAuth v5 GitHub OAuth with JWT session containing `orgId` and GitHub access token.
- Multi-tenant PostgreSQL schema with strict `orgId` scoping across org-bound entities.
- API routes:
  - `POST /api/webhooks/github` (HMAC validation, event persistence, queue dispatch)
  - `POST /api/webhooks/slack` (Slack event persistence)
  - `GET /api/metrics/dora` (DORA compute + Redis cache-aside TTL 60s)
  - `GET /api/prs`
  - `POST /api/prs/[id]/summary` (OpenAI summary)
  - `POST /api/risk-score` (OpenAI risk scoring)
- BullMQ queues: `process-github-event`, `generate-pr-summary`, `compute-dora`.
- Worker processors publish updates over Redis pub/sub channel `devpulse:events`.
- WebSocket server broadcasts pipeline and AI updates to dashboard clients.
- App Router dashboards:
  - `/dashboard`
  - `/dashboard/dora`
  - `/dashboard/prs`
  - `/dashboard/incidents`
  - `/settings`
- Tailwind + lightweight shadcn-style UI primitives.
- Middleware auth guard (`/dashboard`, `/api`) + Redis rate limiting.
- Docker Compose for local PostgreSQL + Redis.
- Prisma migration and seed script.

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```env
DATABASE_URL=
REDIS_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
OPENAI_API_KEY=
NEXT_PUBLIC_WS_URL=
```

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start local infra:

```bash
docker compose up -d
```

3. Generate Prisma client, run migrations, and seed:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4. Start all services:

```bash
pnpm dev
```

Or run independently:

```bash
pnpm --filter @devpulse/web dev
pnpm worker
pnpm ws
```

## Build & Run

```bash
pnpm build
pnpm start
```

## Deployment Notes

- `apps/web` is Vercel-compatible.
- `apps/worker` and `apps/ws` are separate long-running services (deploy on Fly/Render/Kubernetes/VM).
- No hardcoded secrets; all sensitive values come from env vars.
