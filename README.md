# SpendLens — AI Spend Audit for Startups

**SpendLens** is a free AI spend audit tool that helps startup founders and engineering managers discover where they're overspending on AI tools (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf) and surfaces actionable savings opportunities. It's a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

Think: **"Mint for AI tool spend."**

---

## Screenshots

| Landing Page | Audit Results | Shareable Report |
|---|---|---|
| ![Landing Page](https://via.placeholder.com/600x400?text=SpendLens+Landing+Page) | ![Audit Results](https://via.placeholder.com/600x400?text=Audit+Results) | ![Shareable Report](https://via.placeholder.com/600x400?text=Public+Share+Page) |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/spendlens.git
cd spendlens

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys (see ENV VARIABLES section below)

# Run development server
npm run dev

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

### ENV Variables Needed

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For persistence | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For persistence | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For persistence | Supabase service role key |
| `ANTHROPIC_API_KEY` | For AI summaries | Anthropic API key (falls back to template) |
| `RESEND_API_KEY` | For emails | Resend API key (skips email if missing) |
| `RESEND_FROM_EMAIL` | For emails | Sender email address |
| `NEXT_PUBLIC_BASE_URL` | For share links | Production URL |

> **Graceful degradation:** The app works fully without any external services — audits run client-side, AI summaries fall back to deterministic templates, DB saves are skipped.

---

## Decisions

### 1. Single-page form + results (no multi-step wizard)
**Why:** Reduces friction. Users can see all tools at once, and the form-to-results transition is a smooth scroll. Multi-step wizards have higher drop-off rates for lead-gen tools.

### 2. Audit engine runs on the server AND can run on the client
**Why:** The API route runs the full audit server-side (to save to DB), but the shared audit page re-runs the engine client-side from saved `tools_json`. This means shared pages never need a second DB query and work even if Supabase is down.

### 3. In-memory rate limiting instead of Redis
**Why:** For MVP, an in-memory Map works for single-instance deployments. The rate limit resets on deploy, which is acceptable at low volume. ARCHITECTURE.md documents the Redis upgrade path for 10k+/day.

### 4. Free plans excluded from recommendations
**Why:** Suggesting "downgrade to Free" is not actionable — free tiers have severe usage limits that make them impractical for teams. We only recommend paid plan alternatives.

### 5. Honeypot over CAPTCHA for abuse protection
**Why:** CAPTCHAs add friction to a lead-gen funnel. A hidden honeypot field silently catches bots without degrading UX for real users.

---

## Deployed URL

Live Demo: [https://spendlens.vercel.app](https://spendlens.vercel.app)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Testing:** Vitest (11 tests)
- **CI:** GitHub Actions
- **Deployment:** Vercel
