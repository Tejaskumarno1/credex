/**
 * SpendLens Audit Engine
 *
 * Pure TypeScript logic — no AI, no network calls.
 * Evaluates AI tool spend and surfaces actionable savings.
 *
 * Four-pass analysis:
 * 1. Plan fit check — is the plan appropriate for team size?
 * 2. Same-vendor downgrade — is there a cheaper plan from the same vendor?
 * 3. Cross-tool alternative — is there a cheaper tool for the use case?
 * 4. Retail vs credits flag — if spend > $200, flag Credex credits
 */

import { PRICING_DATA, type ToolId, type PlanType, type ToolData } from "./pricingData";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UseCase = "coding" | "writing" | "data_analysis" | "research" | "mixed";

export type Severity = "high" | "medium" | "low" | "optimal";

export interface ToolInput {
  toolId: ToolId;
  planId: string;
  monthlySpend: number; // actual monthly spend (may differ from plan price × seats)
  seats: number;
}

export interface AuditFormData {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  savingsMonthly: number;
  savingsAnnual: number;
  reason: string;
  severity: Severity;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredexCta: boolean;
  alreadyOptimal: boolean;
  totalCurrentSpend: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculatePlanCost(plan: PlanType, seats: number): number {
  if (plan.isApiDirect || plan.isCustom) return -1;
  return plan.isPerUser ? plan.pricePerUser * seats : plan.pricePerUser;
}

function getSeverity(savingsMonthly: number, currentSpend: number): Severity {
  if (currentSpend === 0) return "optimal";
  const savingsPercent = currentSpend > 0 ? (savingsMonthly / currentSpend) * 100 : 0;
  if (savingsPercent >= 40) return "high";
  if (savingsPercent >= 20) return "medium";
  if (savingsMonthly > 0) return "low";
  return "optimal";
}

// ─── Pass 1: Plan Fit Check ─────────────────────────────────────────────────

function checkPlanFit(
  tool: ToolData,
  plan: PlanType,
  seats: number,
  _teamSize: number
): { action: string; reason: string; alternativePlanId: string | null } | null {
  // Check if user is on a team plan with only 1 user (wasteful)
  if (plan.isPerUser && seats <= 1 && plan.minRecommendedUsers && plan.minRecommendedUsers > 1) {
    // Find a cheaper non-team plan
    const cheaperPlan = tool.plans
      .filter(
        (p) =>
          !p.isCustom &&
          !p.isApiDirect &&
          p.pricePerUser < plan.pricePerUser &&
          p.pricePerUser > 0 && // Prefer paid plans — free tiers are too limited
          (!p.minRecommendedUsers || p.minRecommendedUsers <= 1)
      )
      .sort((a, b) => b.pricePerUser - a.pricePerUser)[0]; // Get the best individual plan

    if (cheaperPlan) {
      return {
        action: `Downgrade to ${cheaperPlan.name} plan`,
        reason: `You have ${seats} user(s) on the ${plan.name} plan — the ${cheaperPlan.name} plan at $${cheaperPlan.pricePerUser}/mo is better value for individual use.`,
        alternativePlanId: cheaperPlan.id,
      };
    }
  }

  // Check if user is on an enterprise plan with too few users
  if (plan.isCustom && plan.minRecommendedUsers && seats < plan.minRecommendedUsers) {
    const betterPlan = tool.plans
      .filter(
        (p) =>
          !p.isCustom &&
          !p.isApiDirect &&
          (!p.maxRecommendedUsers || p.maxRecommendedUsers >= seats)
      )
      .sort((a, b) => a.pricePerUser - b.pricePerUser)[0];

    if (betterPlan) {
      return {
        action: `Switch to ${betterPlan.name} plan`,
        reason: `Enterprise plan is overkill for ${seats} users — the ${betterPlan.name} plan provides the same core features at a fraction of the cost.`,
        alternativePlanId: betterPlan.id,
      };
    }
  }

  return null;
}

// ─── Pass 2: Same-Vendor Downgrade ──────────────────────────────────────────

function checkSameVendorDowngrade(
  tool: ToolData,
  plan: PlanType,
  seats: number,
  currentSpend: number
): { action: string; reason: string; savings: number } | null {
  if (plan.isApiDirect || plan.isCustom) return null;

  const currentCost = calculatePlanCost(plan, seats);
  if (currentCost <= 0) return null;

  // Use whichever is higher — the calculated cost or the actual spend
  const effectiveSpend = Math.max(currentCost, currentSpend);

  let bestSavings = 0;
  let bestPlan: PlanType | null = null;

  for (const altPlan of tool.plans) {
    if (altPlan.id === plan.id || altPlan.isCustom || altPlan.isApiDirect) continue;
    if (altPlan.pricePerUser >= plan.pricePerUser) continue;
    if (altPlan.pricePerUser === 0) continue; // Free tiers aren't real downgrades

    const altCost = calculatePlanCost(altPlan, seats);
    if (altCost < 0) continue;

    // Make sure the alternative plan makes sense for the seat count
    if (altPlan.maxRecommendedUsers && seats > altPlan.maxRecommendedUsers) continue;

    const savings = effectiveSpend - altCost;
    if (savings > bestSavings) {
      bestSavings = savings;
      bestPlan = altPlan;
    }
  }

  if (bestPlan && bestSavings > 0) {
    const altCost = calculatePlanCost(bestPlan, seats);
    return {
      action: `Downgrade to ${bestPlan.name} plan`,
      reason: `Switching from ${plan.name} ($${effectiveSpend.toFixed(0)}/mo) to ${bestPlan.name} ($${altCost.toFixed(0)}/mo) saves $${bestSavings.toFixed(0)}/mo with comparable features.`,
      savings: bestSavings,
    };
  }

  return null;
}

// ─── Pass 3: Cross-Tool Alternative ─────────────────────────────────────────

function checkCrossToolAlternative(
  toolInput: ToolInput,
  allInputs: ToolInput[],
  useCase: UseCase
): { action: string; reason: string; savings: number } | null {
  const tool = PRICING_DATA[toolInput.toolId];
  if (!tool) return null;

  const plan = tool.plans.find((p) => p.id === toolInput.planId);
  if (!plan || plan.isApiDirect || plan.isCustom) return null;

  const currentCost = toolInput.monthlySpend > 0
    ? toolInput.monthlySpend
    : calculatePlanCost(plan, toolInput.seats);

  if (currentCost <= 0) return null;

  // Find cheaper alternatives in the same category
  const relevantCategories = useCase === "mixed" ? tool.category : [useCase];
  let bestAlternative: { tool: ToolData; plan: PlanType; cost: number } | null = null;
  let bestSavings = 0;

  for (const [id, altTool] of Object.entries(PRICING_DATA)) {
    if (id === toolInput.toolId) continue;
    // Skip if user already has this tool
    if (allInputs.some((i) => i.toolId === id)) continue;

    // Check if alternative serves the same use case
    const hasOverlap = relevantCategories.some((cat) =>
      altTool.category.includes(cat)
    );
    if (!hasOverlap) continue;

    // Find the best paid plan for their seat count (skip free tiers — they have severe limitations)
    for (const altPlan of altTool.plans) {
      if (altPlan.isCustom || altPlan.isApiDirect) continue;
      if (altPlan.pricePerUser === 0) continue; // Free tiers aren't real alternatives
      if (altPlan.maxRecommendedUsers && toolInput.seats > altPlan.maxRecommendedUsers) continue;

      const altCost = calculatePlanCost(altPlan, toolInput.seats);
      if (altCost < 0) continue;

      const savings = currentCost - altCost;
      if (savings > bestSavings && savings >= 5) {
        // Only suggest if savings are meaningful ($5+/mo)
        bestSavings = savings;
        bestAlternative = { tool: altTool, plan: altPlan, cost: altCost };
      }
    }
  }

  if (bestAlternative) {
    return {
      action: `Consider switching to ${bestAlternative.tool.name} ${bestAlternative.plan.name}`,
      reason: `${bestAlternative.tool.name} ${bestAlternative.plan.name} ($${bestAlternative.cost.toFixed(0)}/mo) offers similar ${useCase} capabilities at $${bestSavings.toFixed(0)}/mo less than ${tool.name} ${plan.name}.`,
      savings: bestSavings,
    };
  }

  return null;
}

// ─── Pass 3b: Redundancy Detection ─────────────────────────────────────────

function checkRedundancy(
  toolInput: ToolInput,
  allInputs: ToolInput[],
  useCase: UseCase
): { action: string; reason: string } | null {
  const tool = PRICING_DATA[toolInput.toolId];
  if (!tool) return null;

  // Check for overlapping tools in the same category
  const overlapping = allInputs
    .filter((i) => i.toolId !== toolInput.toolId)
    .filter((i) => {
      const otherTool = PRICING_DATA[i.toolId];
      if (!otherTool) return false;
      return tool.category.some((cat) => otherTool.category.includes(cat));
    });

  if (overlapping.length === 0) return null;

  // Specific coding tool overlap detection
  const codingTools = ["cursor", "github_copilot", "windsurf"];
  const userCodingTools = allInputs
    .filter((i) => codingTools.includes(i.toolId))
    .map((i) => PRICING_DATA[i.toolId]?.name)
    .filter(Boolean);

  if (
    codingTools.includes(toolInput.toolId) &&
    userCodingTools.length > 1 &&
    (useCase === "coding" || useCase === "mixed")
  ) {
    return {
      action: `Review — you're paying for ${userCodingTools.length} coding assistants`,
      reason: `You're paying for ${userCodingTools.join(" and ")} simultaneously. Most teams only need one AI coding tool — consolidating could save significantly.`,
    };
  }

  // General AI assistant overlap
  const aiAssistants = ["claude", "chatgpt", "gemini"];
  const userAiTools = allInputs
    .filter((i) => aiAssistants.includes(i.toolId))
    .map((i) => PRICING_DATA[i.toolId]?.name)
    .filter(Boolean);

  if (
    aiAssistants.includes(toolInput.toolId) &&
    userAiTools.length > 2
  ) {
    return {
      action: `Review — you're paying for ${userAiTools.length} AI assistants`,
      reason: `You're subscribed to ${userAiTools.join(", ")}. Consider consolidating to 1-2 tools that best fit your ${useCase} workflow.`,
    };
  }

  return null;
}

// ─── Main Audit Function ────────────────────────────────────────────────────

export function runAudit(formData: AuditFormData): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  for (const toolInput of formData.tools) {
    const tool = PRICING_DATA[toolInput.toolId];
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === toolInput.planId);
    if (!plan) continue;

    const currentSpend = toolInput.monthlySpend > 0
      ? toolInput.monthlySpend
      : calculatePlanCost(plan, toolInput.seats);

    // Use the actual spend or the calculated cost
    const effectiveSpend = currentSpend > 0 ? currentSpend : 0;

    let bestAction = "Already optimal";
    let bestSavings = 0;
    let bestReason = "Your current plan is well-matched for your team size and use case.";

    // Pass 1: Plan fit check
    const planFit = checkPlanFit(tool, plan, toolInput.seats, formData.teamSize);
    if (planFit) {
      const altPlan = planFit.alternativePlanId
        ? tool.plans.find((p) => p.id === planFit.alternativePlanId)
        : null;
      if (altPlan) {
        const altCost = calculatePlanCost(altPlan, toolInput.seats);
        if (altCost >= 0) {
          const savings = effectiveSpend - altCost;
          if (savings > bestSavings) {
            bestAction = planFit.action;
            bestSavings = savings;
            bestReason = planFit.reason;
          }
        }
      }
    }

    // Pass 2: Same-vendor downgrade
    const downgrade = checkSameVendorDowngrade(tool, plan, toolInput.seats, effectiveSpend);
    if (downgrade && downgrade.savings > bestSavings) {
      bestAction = downgrade.action;
      bestSavings = downgrade.savings;
      bestReason = downgrade.reason;
    }

    // Pass 3: Cross-tool alternative (only if no same-vendor savings found)
    const crossTool = checkCrossToolAlternative(toolInput, formData.tools, formData.useCase);
    if (crossTool && crossTool.savings > bestSavings) {
      bestAction = crossTool.action;
      bestSavings = crossTool.savings;
      bestReason = crossTool.reason;
    }

    // Pass 3b: Redundancy check — always surfaces as advisory
    const redundancy = checkRedundancy(toolInput, formData.tools, formData.useCase);
    if (redundancy) {
      if (bestSavings === 0) {
        // No other recommendation — make redundancy the primary action
        bestAction = redundancy.action;
        bestReason = redundancy.reason;
      } else {
        // Already have a savings recommendation — append redundancy note
        bestReason = bestReason + " " + redundancy.reason;
      }
    }

    // Pass 4: Credex credits flag (per-tool level)
    if (effectiveSpend > 200 && bestSavings === 0) {
      bestAction = "Explore Credex discounted credits";
      bestReason = `You're spending $${effectiveSpend.toFixed(0)}/mo — Credex offers discounted AI credits from companies that overforecast, potentially saving 15-30%.`;
      bestSavings = Math.round(effectiveSpend * 0.15); // Conservative 15% estimate
    }

    const severity = getSeverity(bestSavings, effectiveSpend);

    recommendations.push({
      toolId: toolInput.toolId,
      toolName: tool.name,
      currentPlan: plan.name,
      currentSpend: effectiveSpend,
      recommendedAction: bestAction,
      savingsMonthly: Math.round(bestSavings * 100) / 100,
      savingsAnnual: Math.round(bestSavings * 12 * 100) / 100,
      reason: bestReason,
      severity,
    });
  }

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.savingsMonthly,
    0
  );
  const totalAnnualSavings = recommendations.reduce(
    (sum, r) => sum + r.savingsAnnual,
    0
  );
  const totalCurrentSpend = recommendations.reduce(
    (sum, r) => sum + r.currentSpend,
    0
  );

  return {
    recommendations,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 12) / 12, // keep precision
    showCredexCta: totalMonthlySavings > 500,
    alreadyOptimal: totalMonthlySavings < 100,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
  };
}
