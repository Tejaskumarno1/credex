# Dev Log — SpendLens

## Day 1 — 2026-05-18
**Hours worked:** 3  
**What I did:**  
Set up the initial Next.js project structure, configured Tailwind CSS with the Credex brand colors (off-black, neon green, dark forest), and planned the architecture. Created the Supabase project and drafted the initial database schema (`schema.sql`). Wrote the GTM and ECONOMICS draft outlines.

**What I learned:**  
Vercel's Edge runtime has some limitations with standard Node APIs which means I have to be careful with how I handle the Anthropic API calls if I want to run them on the Edge.

**Blockers / what I'm stuck on:**  
None so far.

**Plan for tomorrow:**  
Build the spend input form UI and state management.

---

## Day 2 — 2026-05-19
**Hours worked:** 4.5  
**What I did:**  
Built out the full single-page input form. Added the tool toggles, seat inputs, and dropdowns for plans. I originally started a multi-step Typeform style UI but scrapped it halfway through after realizing it was too much friction to go back and forth between tabs to check billing. 

**What I learned:**  
Managing state for an arbitrary number of dynamically toggled tools is tricky. I used a dictionary where keys are tool IDs and values are objects containing `{ plan, seats, spend, useCase }`.

**Blockers / what I'm stuck on:**  
Slight UI alignment issue with the sticky footer overlapping the last form field on mobile screens.

**Plan for tomorrow:**  
Fix the footer layout and start writing the core Audit Engine logic.

---

## Day 3 — 2026-05-20
**Hours worked:** 6  
**What I did:**  
Focused entirely on the core Audit Engine logic. Wrote the cross-tool redundancy checks (e.g., Cursor vs Copilot) and the plan downgrade logic (e.g., Team vs Pro). Set up `PRICING_DATA.md` and traced every number to an official URL. Added Vitest and wrote 11 test cases to verify the math is correct.

**What I learned:**  
Testing financial logic is critical. AI generated some of the boilerplate tests, but I had to correct the actual assertions because it didn't understand the nuances of seat minimums.

**Blockers / what I'm stuck on:**  
None. The tests are green.

**Plan for tomorrow:**  
Build the Audit Results page UI and integrate the Anthropic API for the personalized summary.

---

## Day 4 — 2026-05-21
**Hours worked:** 5  
**What I did:**  
Built the Audit Results view with a "Hero" section showing total potential savings. Integrated the Anthropic API to generate a 100-word personalized summary. Wrote `PROMPTS.md` to document the system prompt and constraints.

**What I learned:**  
Anthropic's `claude-3-haiku` is incredibly fast, but `sonnet` yields much better reasoning for the summaries. I stuck with Sonnet but had to implement a strict 7-second timeout with an `AbortController` to prevent Vercel Serverless Function timeouts (10s max on Hobby tier). 

**Blockers / what I'm stuck on:**  
The Vercel timeout issue took a while to debug, but the `AbortController` fallback pattern works well now.

**Plan for tomorrow:**  
Supabase integration for lead capture, sending transactional emails via Resend.

---

## Day 5 — 2026-05-22
**Hours worked:** 4  
**What I did:**  
Wired up the email capture form. When the user enters their email, it saves the lead and the full `tools_json` audit results into Supabase. Implemented the shareable URL feature (`/audit/[id]`). Added Resend integration to fire a confirmation email. Added a honeypot field for basic abuse protection instead of hCaptcha to keep friction low.

**What I learned:**  
Client-side hydration on the shareable `/audit/[id]` page was tricky because the audit logic re-runs client side from the saved database JSON to avoid needing an API route for every view.

**Blockers / what I'm stuck on:**  
Open Graph metadata for dynamic routes in Next.js 14 requires `generateMetadata`. I had to read the docs to get the Twitter card preview working correctly for the share links.

**Plan for tomorrow:**  
Finalize entrepreneurial files and documentation.

---

## Day 6 — 2026-05-23
**Hours worked:** 3.5  
**What I did:**  
Conducted 3 user interviews and documented them in `USER_INTERVIEWS.md`. Finished `GTM.md`, `ECONOMICS.md`, `LANDING_COPY.md`, and `METRICS.md`. Updated the Audit Engine slightly based on feedback from the interviews (removed API direct recommendations for non-technical users).

**What I learned:**  
User interviews are humbling. Founders care more about the friction of migrating tools than they do about saving $50/month. I had to pivot my engine's messaging to focus on identifying redundancies rather than just pure cost-cutting.

**Blockers / what I'm stuck on:**  
None.

**Plan for tomorrow:**  
Write `REFLECTION.md`, update `README.md`, deploy to Vercel, and submit.

---

## Day 7 — 2026-05-24
**Hours worked:** 2  
**What I did:**  
Wrote `REFLECTION.md`. Deployed the project to Vercel. Ran Lighthouse tests to verify performance and accessibility metrics. Cleaned up the codebase, added final screenshots to the `README.md`, and prepared for final submission.

**What I learned:**  
Deploying to Vercel was smooth, but I had to make sure to add all my environment variables (`SUPABASE_URL`, `ANTHROPIC_API_KEY`, etc.) correctly in the Vercel dashboard.

**Blockers / what I'm stuck on:**  
Project is finished!

**Final reflections:**  
Building an entrepreneurial assignment is much more fun than a Leetcode problem. It forces you to think about the user and the distribution, not just the code. I'm proud of the UI polish and the defensible math in the audit engine.
