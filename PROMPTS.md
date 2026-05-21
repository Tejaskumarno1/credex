# Prompts — SpendLens

## AI Summary System Prompt

```
You are a smart, friendly CFO advisor helping startup founders and engineering managers understand their AI tool spending. 

Write a short, specific, non-generic paragraph (~100 words) summarizing their AI spend audit results. 

Rules:
- Be specific: reference the exact tools, plans, and dollar amounts
- Tone: like a smart CFO friend giving honest, practical advice over coffee
- Focus on the 1-2 most impactful actions they can take
- If savings are minimal, congratulate them on smart spending
- Never be preachy or lecture-like
- Never use corporate jargon like "leverage", "optimize", or "streamline"
- End with a clear next step
- Do NOT use bullet points or lists — write in flowing prose
```

## User Prompt Template

```
Here's the audit data for a {teamSize}-person team using AI tools for {useCase}:

Tools in use: {toolNames}
Total current monthly spend: ${totalCurrentSpend}
Total potential monthly savings: ${totalMonthlySavings}
Total potential annual savings: ${totalAnnualSavings}

Top recommendations:
- {tool1} ({plan1}): {action1} → saves ${savings1}/mo. Reason: {reason1}
- {tool2} ({plan2}): {action2} → saves ${savings2}/mo. Reason: {reason2}

{optimalNote}

Write a ~100 word personalized summary paragraph.
```

## Why It Was Written This Way

### System Prompt Design Decisions

1. **"CFO friend" persona** — Tested "financial advisor", "cost consultant", and "CFO friend". The friend persona produces the most natural, non-robotic output. Users relate to advice that feels personal rather than institutional.

2. **Anti-jargon rules** — Early iterations produced summaries full of "leverage your spend" and "optimize your stack". Explicitly banning these words forces Claude to use specific, concrete language.

3. **No bullet points rule** — Bullet points make the summary look like another audit report section. Flowing prose feels like a personal note and visually contrasts with the data-heavy breakdown above.

4. **~100 words constraint** — Tested 50, 100, and 200 word targets:
   - 50 words: Too terse, can't reference specific tools
   - 100 words: Sweet spot — specific enough to feel personalized, short enough to read in 15 seconds
   - 200 words: Rambling, users don't read it

5. **"End with a clear next step"** — Without this, Claude tends to end with generic encouragement. This forces an actionable closing.

### User Prompt Design Decisions

1. **Structured data format** — Claude performs better with structured input than narrative input. The line-by-line format reduces hallucination.

2. **Top 2 recommendations only** — Passing all recommendations leads to a summary that tries to mention everything and says nothing specific.

3. **Optional optimal note** — If the user is already optimal, the prompt signals this so Claude can congratulate rather than suggest.

## What Was Tried That Didn't Work

1. **JSON input format** — Claude produced more template-sounding output with JSON. Readable text format produced more natural summaries.

2. **Asking for "a paragraph a VP of Finance would forward to the CEO"** — This made the tone too formal and corporate. The CFO friend persona works better.

3. **Including all tool recommendations** — The summary became a wall of text trying to mention every tool. Limiting to top 2 was the key insight.

4. **Temperature 0.9** — Too creative, sometimes fabricated advice not in the data. Temperature 0 (default) is more reliable.

## Fallback Template

When the Anthropic API is unavailable (network error, rate limit, missing key, timeout), a deterministic fallback generates a summary from the audit data:

```typescript
// Already optimal case:
"Your {teamSize}-person team is spending wisely on AI tools. With {tools} in 
your stack for {useCase}, you're already on the right plans for your team size. 
No immediate changes needed — you're getting good value for your investment. 
Keep an eye on your usage patterns as your team grows, since plan economics 
can shift at different team sizes."

// Savings found case:
"Your {teamSize}-person team could save ${totalMonthlySavings}/month 
(${totalAnnualSavings}/year) on AI tools. The biggest opportunity is 
{topTool}: {topReason}. Also consider {secondTool} — {secondReason}. 
With savings this significant, it's worth exploring Credex's discounted 
AI credits to capture even more value."
```

The fallback:
- Always uses real audit data (never generic)
- References specific tools and dollar amounts
- Shows a subtle "AI summary unavailable — showing template" badge
- Never crashes the results page
