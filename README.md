# ReelMind

AI-powered content brief generator for food and hotel reel creators.

ReelMind helps creators on Instagram, TikTok, and YouTube Shorts plan and produce better content — faster. Input a dish or hotel name, and get a full production brief: concept, hook, shot-by-shot storyline, talking points, platform captions, hashtags, and a b-roll list.

---

## Features

- **AI Brief Generation** — Full content briefs for food or hotel reviews, structured for short-form video
- **Hook Generator** — 5 hook variations per brief (curiosity gap, bold claim, relatable problem, surprising fact, question)
- **Content Calendar** — Schedule briefs to dates with month and week views
- **Settings** — Swap between Gemini (free, default) and Claude (bring your own key) per user
- **Analytics** *(coming soon)* — Track views, likes, shares, and engagement per post
- **Team Management** *(coming soon)* — Invite editors and viewers to your workspace

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Lucide React |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| AI — Default | Google Gemini 2.5 Flash Lite (free tier) |
| AI — Optional | Anthropic Claude Sonnet 4.6 (user-supplied key) |
| Language | TypeScript 5 |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)
- *(Optional)* An [Anthropic Claude API key](https://console.anthropic.com) for higher-quality output

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Setup

ReelMind uses a manual schema approach — no Supabase CLI migrations.

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`

This creates all tables (`profiles`, `workspaces`, `workspace_members`, `briefs`, `hooks`, `performance_logs`, `calendar_events`), RLS policies, and triggers that auto-create a profile and workspace on sign-up.

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/jeffrykomala/reelmind-app.git
cd reelmind-app

# 2. Install dependencies
npm install

# 3. Set up environment variables (then fill in your values)
cp .env.local .env.local

# 4. Run the database schema (see above)

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account.

---

## Project Structure

```
reelmind/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Protected routes (dashboard, briefs, calendar, settings)
│   └── api/              # Route handlers (generate/brief, generate/hooks, calendar/events)
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── briefs/           # Brief form and detail views
│   ├── calendar/         # Calendar view and event form
│   └── settings/         # Settings form
├── lib/
│   ├── ai/               # Gemini & Claude integrations, prompt templates
│   └── supabase/         # Server, client, and admin Supabase clients
└── supabase/
    └── schema.sql        # Full database schema
```

---

## AI Provider Notes

By default, ReelMind uses **Google Gemini** (free, no setup beyond the API key in `.env.local`).

To use **Claude** for higher-quality briefs, go to **Settings** in the app and paste your Anthropic API key. It is stored encrypted in your user profile and used only for your requests.

---

## Roadmap

- [ ] Analytics dashboard (views, likes, shares, engagement per post)
- [ ] Team management (invite editors and viewers to workspace)
- [ ] Multi-workspace UI
- [ ] Performance log import via API
