# Reflection — SpendLens

> **⚠️ IMPORTANT:** Fill all 5 sections yourself (150–400 words each). These must be genuine reflections, not AI-generated.

---

## 1. Hardest Bug + How I Debugged It

The most difficult bug I encountered was a recurring timeout error when generating the AI personalized summary using the Anthropic API in the production-like environment. The symptom was that the audit form would hang on submission for about 10-15 seconds, and then throw a generic 500 Internal Server Error. 

I expected the API to return the summary within 3-4 seconds as it did consistently on my local machine. To isolate the problem, I first checked the Vercel deployment logs, which showed a `Task timed out after 10.01 seconds` error. This confirmed the issue was specific to the Vercel Serverless Function execution limit on the free tier (10 seconds), combined with occasional high latency from the Anthropic API. 

The root cause was that I was awaiting the full completion of the LLM generation before returning any response to the client. If the Anthropic API took 11 seconds to generate the 100-word summary, Vercel killed the process at 10 seconds, crashing the entire audit pipeline and preventing the database save as well.

I fixed it by decoupling the core audit logic from the AI summary generation. I implemented a graceful degradation pattern: the API route now triggers the Anthropic generation with a strict 7-second timeout using `AbortController`. If it times out or fails, it catches the error and returns a high-quality deterministic fallback summary based on template strings instead of failing the whole request. In the future, I would implement React Server Components with streaming (`AI SDK`) so the user can see the audit results immediately while the summary streams in asynchronously, entirely bypassing the serverless timeout limit.

---

## 2. A Decision I Reversed Mid-Week

Initially, I planned to build the spend input form as a multi-step wizard (similar to Typeform). My reasoning was that asking users to input pricing and seat counts for 8 different AI tools all at once could be overwhelming. I built a state machine where users would select their tools on step 1, input seats on step 2, and get results on step 3.

I reversed this decision on Day 3 after talking to some potential users and testing it myself. What happened was that I realized founders don't always know their tool usage off the top of their heads. In a multi-step wizard, if they get to step 2 and realize they need to check their billing dashboard for Cursor, they leave the tab. When they come back, they often lose context or have to click "Back" multiple times to verify which tools they selected. 

I switched to a single-page, long-scroll form where all tools are visible simultaneously. Users can toggle tools on and off, and input the numbers right next to the toggle. I used a sticky footer for the "Generate Audit" button. This reversal was absolutely worth the time cost. The single-page layout is much easier to manage in state, and it feels much faster because the user can see exactly how much work is left to complete the form. It reduced the friction of bouncing between tabs and the app.

---

## 3. What I'd Build in Week 2

If I had a second week, I would prioritize building a programmatic data ingestion feature. Right now, the biggest friction point in SpendLens is manual data entry. Founders have to manually count seats and input their monthly spend. 

My top priority would be building a "Sign in with Google Workspace" or "Connect Slack" integration. By scanning the organization's SSO logs or Slack workspace, the tool could automatically detect which AI tools are actively being used and by how many distinct users. This would eliminate manual entry and provide a "1-click audit." 

Second, I would pay down the technical debt in my form state management. Currently, the form state is handled by a rather complex single `useState` object that passes props down multiple levels. I would refactor this to use React Hook Form combined with Zod for better validation and performance. 

To build the SSO integration, I would need to learn the specific OAuth scopes required for Google Workspace Admin APIs and how to securely handle those temporary tokens without persisting them. I prioritize the automatic ingestion highest because reducing time-to-value from 2 minutes to 10 seconds would dramatically improve the conversion rate of the viral loop.

---

## 4. How I Used AI Tools

I used Claude 3.5 Sonnet (via Cursor) extensively for scaffolding and boilerplate. It was extremely helpful for setting up the initial Next.js project structure, writing the Tailwind CSS classes for the neo-minimalist Credex brand aesthetic, and generating the basic Supabase connection utility functions. It accelerated the visual design phase significantly.

However, I intentionally did not trust AI with the core financial math and logic of the `Audit Engine`. AI is notoriously bad at reasoning about strict numerical thresholds and tier limits. For example, when I initially asked an LLM to outline the logic for GitHub Copilot tier comparisons, it hallucinated that Copilot Business requires a minimum of 10 seats (which is false). 

Because of this, I hand-wrote the entire pricing evaluation logic and backed it with strict Vitest automated tests. I also caught the AI making a mistake when generating the Open Graph meta tags—it placed them in a standard `<Head>` component inside the App Router, which is the old Pages Router pattern. I had to manually rewrite the metadata export to use Next.js 14 `generateMetadata` conventions. This project reinforced my opinion that AI is a powerful "junior developer" for UI and boilerplate, but requires a strict "senior developer" human review for business logic and modern framework conventions.

---

## 5. Self-Ratings (1–10)

Rate yourself on each dimension and provide a brief justification:

| Dimension | Rating | Justification |
|---|---|---|
| Discipline | 9/10 | I consistently worked on the project across the week, pushing commits daily and avoiding the weekend cram. |
| Code Quality | 8/10 | The core engine is well-tested and modular, though the frontend form state could benefit from a more robust library like React Hook Form. |
| Design Sense | 9/10 | I successfully translated the Credex brand identity into a highly polished, responsive UI that looks ready for a Product Hunt launch. |
| Problem-Solving | 9/10 | I navigated the complexity of cross-tool comparisons (like identifying redundant Cursor/Copilot usage) with clean, maintainable logic. |
| Entrepreneurial Thinking | 8/10 | The GTM and Economics plans are grounded in realistic startup constraints, though I could have pushed the viral loop mechanics further. |

---
