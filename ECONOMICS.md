# Economics — SpendLens

## What a Converted Lead Is Worth to Credex

Credex sells discounted AI infrastructure credits. A typical customer:
- Spends **$5,000–$50,000/month** on AI infrastructure (API calls, compute, model hosting)
- Gets **10–30% discount** through Credex (from companies that over-forecasted their usage)
- Credex takes a **margin of 5–15%** on the spread between wholesale and retail pricing

**Per-customer annual value to Credex:**

| Customer Tier | Monthly AI Spend | Credex Margin (10%) | Annual Value |
|---|---|---|---|
| Small startup | $2,000/mo | $200/mo | **$2,400/yr** |
| Mid-stage startup | $10,000/mo | $1,000/mo | **$12,000/yr** |
| Growth company | $50,000/mo | $5,000/mo | **$60,000/yr** |

**Weighted average customer value:** ~$8,000/year (assuming 60% small, 30% mid, 10% growth)

**Blended LTV (assuming 24-month retention):** ~$16,000

## CAC Estimate Per GTM Channel

| Channel | Est. CAC | Reasoning |
|---|---|---|
| Product Hunt | $0 (organic) | Free to launch, high intent traffic |
| Reddit/HN posts | $0 (organic) | Time cost only, ~2 hours per post |
| X/Twitter threads | $0 (organic) | Content creation, 30 min per thread |
| LinkedIn outreach | $0–$50 | Time cost + optional Sales Navigator |
| SEO (blog content) | $200–$500 | Writer cost per article, compounds over time |
| Paid ads (future) | $50–$150/lead | LinkedIn/Google Ads for "AI pricing" keywords |

**Blended CAC (organic launch):** ~$5–$15 per audit completed, ~$25–$50 per qualified lead (email captured with savings >$500/mo)

## Conversion Funnel Math

```
Visitors to SpendLens                    100%    (1,000/month)
├── Start the audit form                  60%    (600)
├── Complete the audit                    40%    (400)
├── Capture email (lead)                  15%    (150)
├── Qualified lead (savings >$500/mo)      5%    (50)
├── Book consultation                      2%    (20)
├── Start Credex trial/pilot              0.8%   (8)
└── Convert to paying customer            0.4%   (4)
```

**Unit economics at 1,000 visitors/month:**
- 4 customers × $8,000/yr = **$32,000 ARR** per 1,000 monthly visitors
- CAC: ~$0 (organic) → infinite LTV:CAC ratio at launch
- Even at $50 CAC: $200/customer → 80:1 LTV:CAC (exceptional)

## What It Takes to Drive $1M ARR in 18 Months

**Target:** $1,000,000 ARR = ~125 customers at $8,000/yr average

**Working backwards:**

| Metric | Monthly Target | 18-Month Total |
|---|---|---|
| Paying customers needed | 7/month | 125 |
| Consultations booked (50% close) | 14/month | 252 |
| Qualified leads (40% book) | 35/month | 630 |
| Email captures (23% qualify) | 150/month | 2,700 |
| Audits completed (38% capture) | 400/month | 7,200 |
| Visitors (40% complete audit) | 1,000/month | 18,000 |

**Is 1,000 visitors/month achievable?** Yes, through:
1. **Product Hunt launch:** 500–2,000 visitors day 1
2. **SEO for "AI tool pricing comparison":** 200–500/month by month 6
3. **Reddit/HN viral posts:** 500–1,000 per successful post
4. **Credex sales team referrals:** 100–200/month
5. **Shareable audit URLs:** Viral coefficient of ~1.2 (each audit shared gets ~0.2 new audits)

**Key assumption:** Credex must have a sales team that can close warm leads. SpendLens generates demand; Credex converts it. Without sales capacity, leads decay.

**Break-even timeline:**
- Months 1–3: Tool cost ~$100/mo (Supabase, Vercel, Anthropic). Revenue from first customers: ~$2,000/mo
- Month 4+: Profitable (organic traffic + low infrastructure costs)
- Month 12: ~$50,000 ARR with pure organic growth
- Month 18: $1M ARR requires paid channels kicking in by month 8–10

**Risk factors:**
- AI tool pricing changes frequently — audit engine needs monthly updates
- Credex sales capacity is the bottleneck, not lead generation
- If average deal size is smaller than $8k/yr, need more volume
