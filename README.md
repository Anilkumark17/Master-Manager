# Master Manager

Execution OS for startups — project workspaces with product discovery, PRD generation, dev architecture docs, and designer deliverables. **Full-stack Next.js app** (API routes + UI in one project).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables into `.env.local`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-long-random-secret
OPENROUTER_API_KEY=your-key
OPENROUTER_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-2.5-pro
```

3. Push the database schema:

```bash
npm run db:push
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:push` | Sync Drizzle schema to PostgreSQL |
| `npm run db:studio` | Open Drizzle Studio |

## Architecture

- **UI**: Next.js App Router (`app/`, `components/`)
- **API**: Next.js Route Handlers (`app/api/`)
- **Server logic**: `lib/server/` (auth, projects, discovery, PRD, dev, designer)
- **Database**: PostgreSQL (Neon) via Drizzle ORM

Deploy to [Vercel](https://vercel.com) or any Node.js host — one `next start` serves both frontend and API.
