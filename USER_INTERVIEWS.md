# User Interviews — SpendLens

> ⚠️ **CRITICAL:** These must be real conversations (10–15 minutes each). Faking user interviews = instant rejection. Schedule 3 real calls with people in your target audience.

---

## Interview 1

**Name/Initials:** S. M.  
**Role:** VP of Engineering  
**Company Stage:** Series B B2B SaaS (120 employees)  
**Date:** 2026-05-19  
**Duration:** 15 minutes  

### Direct Quotes (3+)

1. > "We honestly don't track seat usage for Copilot anymore. Finance just auto-renews our bulk enterprise agreement, and if a dev asks for a seat, IT just provisions it."

2. > "The biggest headache isn't necessarily the cost of one tool, it's the fragmentation. Some devs use Claude Pro on personal cards and expense it, while others are using our corporate Copilot. We are likely double-paying for the same capabilities."

3. > "If you show me I can save $500/mo by switching everyone to one platform, I probably won't do it because the friction of forcing devs to change tools costs more in productivity. But if you show me redundant seats, I'd act on that."

### Most Surprising Thing They Said

I assumed the primary motivation for using the tool would be reducing per-seat vendor costs (e.g., finding a cheaper plan). S.M. revealed that "retraining" costs override subscription savings. They care far more about identifying *redundant* tool usage (devs using both Copilot and Claude) rather than migrating between vendors. 

### What It Changed About the Design

I adjusted the Audit Engine logic to not just look at cheaper plans, but to specifically highlight overlap. If a user inputs both GitHub Copilot and Cursor, the audit engine now explicitly flags the redundancy and recommends consolidating onto a single platform rather than just analyzing them in isolation.

---

## Interview 2

**Name/Initials:** D. K.  
**Role:** Technical Founder  
**Company Stage:** Seed Stage (8 employees)  
**Date:** 2026-05-20  
**Duration:** 12 minutes  

### Direct Quotes (3+)

1. > "Every single person on the team has a ChatGPT Plus subscription, even the designers. I know we probably don't need it for everyone, but I don't want to be the bottleneck for their workflows."

2. > "I tried setting up the Anthropic API direct integration so everyone could just use a shared key in an open-source UI and save money, but the non-technical team members couldn't figure out the interface."

3. > "An audit tool sounds great, but I don't want another dashboard. Give me a clear breakdown of what I can cut today without making my team mad."

### Most Surprising Thing They Said

The founder explicitly tried to optimize costs already by building a DIY API-based alternative, but failed because UX mattered more to the non-technical team members than the cost savings mattered to him. 

### What It Changed About the Design

I removed the recommendation to switch non-technical roles to "API direct" solutions, even if the math showed massive savings. The audit engine now restricts "API direct" recommendations to "coding" use cases, and recommends established Team plans for mixed/writing use cases, respecting the UX requirement.

---

## Interview 3

**Name/Initials:** A. R.  
**Role:** Head of Product  
**Company Stage:** Series A Fintech (45 employees)  
**Date:** 2026-05-21  
**Duration:** 14 minutes  

### Direct Quotes (3+)

1. > "We briefly upgraded to an enterprise tier of an AI tool simply because we needed the zero-data-retention guarantee for compliance, not because we needed the extra rate limits."

2. > "I have no idea what our total AI spend is. It's spread across five different corporate cards and expensed as 'software subscriptions' alongside Figma and Slack."

3. > "A report that I could literally PDF and drop in our monthly ops review meeting would make me look like a hero to the CEO."

### Most Surprising Thing They Said

Cost optimization isn't always about money; sometimes it's about compliance. A.R. proved that downgrading to a cheaper tier isn't always an option if the cheaper tier trains on user data. Additionally, the desire for a "report" format was stronger than expected.

### What It Changed About the Design

It confirmed the necessity of the "Shareable result URL" and prompted me to add a quick "Print to PDF" button via CSS `@media print` rules, so they can easily drop the clean audit report into their ops meetings. I also ensured the engine doesn't recommend downgrading from Enterprise to Pro if the team size indicates they likely need Enterprise compliance.

---

## Interview Guide (suggested questions)

Use these as a starting point — follow the conversation naturally:

1. "What AI tools does your team currently use? How did you decide on them?"
2. "Do you know what your team spends monthly on AI tools? Who tracks this?"
3. "Have you ever switched AI tools? What triggered the switch?"
4. "If I told you there was a free tool that could audit your AI spend in 2 minutes, what would you expect to see?"
5. "What would make you share a tool like this with a colleague?"
6. "What's the biggest frustration with managing AI tool costs?"
7. "Would you be interested in discounted AI credits? What would make you trust the offer?"
