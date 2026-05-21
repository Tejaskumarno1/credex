# Metrics — SpendLens

## North Star Metric

**Qualified leads per week** — defined as email captures where `savings_monthly > $500`.

**Why this metric:**
- It directly ties to Credex's revenue (qualified leads → consultations → credit purchases)
- It balances volume (audits completed) with quality (high savings = high-value prospect)
- It's measurable from day 1 with no additional tooling
- It aligns the product team with business outcomes — improving the audit experience increases both completion rates and savings accuracy

A "vanity metric" like total audits completed would incentivize optimizing for low-intent users. A revenue metric is too downstream to guide weekly decisions. Qualified leads per week is the right altitude.

## Three Input Metrics

### 1. Audit completion rate
**Definition:** % of visitors who start the form AND submit it successfully  
**Target:** 40%+  
**Why it matters:** Low completion = form is too long, confusing, or the value prop isn't clear enough. This is the top-of-funnel health check.

### 2. Average savings identified per audit
**Definition:** Mean `total_savings_monthly` across all completed audits  
**Target:** $200+/month  
**Why it matters:** If savings are consistently low, either our pricing data is wrong, our recommendation engine is too conservative, or we're attracting users who don't have room to save. Low averages mean fewer qualified leads.

### 3. Email capture rate (post-audit)
**Definition:** % of completed audits that result in an email submission  
**Target:** 30%+  
**Why it matters:** This measures whether the audit delivers enough value that users want to save their results. If results are good but capture is low, the lead form UX needs work.

## What to Instrument First

In order of priority:

1. **Audit form submissions** — `POST /api/audit` success count and error rate
2. **Savings distribution** — Histogram of `total_savings_monthly` values to understand our user base
3. **Lead capture conversion** — `POST /api/lead` success count relative to audit completions
4. **Tool selection frequency** — Which tools are most commonly audited (guides feature prioritization)
5. **Share URL creation** — How often users share their results (viral coefficient signal)
6. **Credex CTA click-through** — When `showCredexCta=true`, how often do users click "Book a Consultation"

**Implementation:** Start with Vercel Analytics (free) for page views and API route invocation counts. Add PostHog or Mixpanel for event-level tracking once you hit 100+ weekly audits.

## What Number Triggers a Pivot

**If after 4 weeks of active distribution:**

- **< 5 qualified leads/week** despite 200+ completed audits → The savings engine isn't finding real value. Pivot to more aggressive recommendations or expand tool coverage.
- **< 20% audit completion rate** → The form is too complex or the landing page isn't compelling enough. Simplify radically — maybe start with just 3 tools instead of 8.
- **< 10% email capture rate** → Users don't value the results enough to give their email. The audit output needs to be more actionable or visually compelling.
- **0 Credex consultations booked** in 4 weeks → The CTA positioning is wrong, the $500/mo threshold is too high, or the Credex value prop isn't resonating. Test lower thresholds, different CTA copy, or embedded Calendly.

**The kill criteria:** If none of the above metrics improve after 8 weeks of iteration, the tool isn't generating pipeline. Either the target audience is wrong (pivot to larger companies) or the approach is wrong (pivot from self-serve audit to concierge audit).
