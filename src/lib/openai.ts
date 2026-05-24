/**
 * OpenAI API integration for personalized audit summaries.
 *
 * Uses gpt-4o via fetch.
 * Falls back to a deterministic template if the API call fails.
 */

import type { AuditResult, UseCase } from "./auditEngine";

const SYSTEM_PROMPT = `You are a smart, friendly CFO advisor helping startup founders and engineering managers understand their AI tool spending. 

Write a short, specific, non-generic paragraph (~100 words) summarizing their AI spend audit results. 

Rules:
- Be specific: reference the exact tools, plans, and dollar amounts
- Tone: like a smart CFO friend giving honest, practical advice over coffee
- Focus on the 1-2 most impactful actions they can take
- If savings are minimal, congratulate them on smart spending
- Never be preachy or lecture-like
- Never use corporate jargon like "leverage", "optimize", or "streamline"
- End with a clear next step
- Do NOT use bullet points or lists — write in flowing prose`;

interface SummaryInput {
  auditResult: AuditResult;
  useCase: UseCase;
  teamSize: number;
  toolNames: string[];
}

export async function generateSummary(input: SummaryInput): Promise<{
  summary: string;
  isAiFallback: boolean;
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not set — using fallback summary");
      return { summary: generateFallbackSummary(input), isAiFallback: true };
    }

    const topRecommendations = input.auditResult.recommendations
      .filter((r) => r.savingsMonthly > 0)
      .sort((a, b) => b.savingsMonthly - a.savingsMonthly)
      .slice(0, 2);

    const userPrompt = `Here's the audit data for a ${input.teamSize}-person team using AI tools for ${input.useCase}:

Tools in use: ${input.toolNames.join(", ")}
Total current monthly spend: $${input.auditResult.totalCurrentSpend}
Total potential monthly savings: $${input.auditResult.totalMonthlySavings}
Total potential annual savings: $${input.auditResult.totalAnnualSavings}

Top recommendations:
${topRecommendations
  .map(
    (r) =>
      `- ${r.toolName} (${r.currentPlan}): ${r.recommendedAction} → saves $${r.savingsMonthly}/mo. Reason: ${r.reason}`
  )
  .join("\n")}

${input.auditResult.alreadyOptimal ? "Their spending is already well-optimized." : ""}

Write a ~100 word personalized summary paragraph.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 256,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, await response.text());
      return { summary: generateFallbackSummary(input), isAiFallback: true };
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary || typeof summary !== "string") {
      return { summary: generateFallbackSummary(input), isAiFallback: true };
    }

    return { summary, isAiFallback: false };
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return { summary: generateFallbackSummary(input), isAiFallback: true };
  }
}

/**
 * Deterministic fallback summary when AI is unavailable.
 * Uses the audit data to generate a specific, helpful paragraph.
 */
export function generateFallbackSummary(input: SummaryInput): string {
  const { auditResult, useCase, teamSize, toolNames } = input;
  const { totalMonthlySavings, totalAnnualSavings, recommendations } = auditResult;

  if (auditResult.alreadyOptimal) {
    return `Your ${teamSize}-person team is spending wisely on AI tools. With ${toolNames.join(
      " and "
    )} in your stack for ${useCase}, you're already on the right plans for your team size. No immediate changes needed — you're getting good value for your investment. Keep an eye on your usage patterns as your team grows, since plan economics can shift at different team sizes.`;
  }

  const topRec = recommendations
    .filter((r) => r.savingsMonthly > 0)
    .sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];

  const secondRec = recommendations
    .filter((r) => r.savingsMonthly > 0 && r.toolId !== topRec?.toolId)
    .sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];

  let summary = `Your ${teamSize}-person team could save $${totalMonthlySavings.toLocaleString()}/month ($${totalAnnualSavings.toLocaleString()}/year) on AI tools.`;

  if (topRec) {
    summary += ` The biggest opportunity is ${topRec.toolName}: ${topRec.reason}`;
  }

  if (secondRec) {
    summary += ` Also consider ${secondRec.toolName} — ${secondRec.reason}`;
  }

  if (totalMonthlySavings > 500) {
    summary += ` With savings this significant, it's worth exploring Credex's discounted AI credits to capture even more value.`;
  }

  return summary;
}

/** Export the system prompt for documentation */
export const AI_SYSTEM_PROMPT = SYSTEM_PROMPT;
