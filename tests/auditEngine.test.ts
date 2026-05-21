/**
 * SpendLens Audit Engine — Unit Tests
 *
 * Tests cover all four analysis passes plus edge cases.
 * 9 tests total, covering plan fit, same-vendor, cross-tool, redundancy, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { runAudit, type AuditFormData } from "@/lib/auditEngine";

describe("Audit Engine", () => {
  // ─── Test 1: Plan Fit — Team plan for 1 user should recommend downgrade ────
  describe("Pass 1: Plan Fit Check", () => {
    it("recommends savings when ChatGPT Team is used by 1 user", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "chatgpt",
            planId: "chatgpt_team",
            monthlySpend: 30,
            seats: 1,
          },
        ],
        teamSize: 1,
        useCase: "writing",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      expect(rec.savingsMonthly).toBeGreaterThan(0);
      // Should recommend either Plus (same-vendor) or a cheaper cross-tool alternative
      expect(rec.severity).not.toBe("optimal");
    });

    it("recommends downgrade when Claude Team is used by 1 person", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "claude",
            planId: "claude_team",
            monthlySpend: 25,
            seats: 1,
          },
        ],
        teamSize: 1,
        useCase: "research",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      expect(rec.savingsMonthly).toBeGreaterThan(0);
      expect(rec.recommendedAction).toContain("Pro");
    });
  });

  // ─── Test 2: Same-Vendor Downgrade ─────────────────────────────────────────
  describe("Pass 2: Same-Vendor Downgrade", () => {
    it("finds savings when downgrading Cursor Business for small teams", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "cursor",
            planId: "cursor_business",
            monthlySpend: 120, // 3 users × $40
            seats: 3,
          },
        ],
        teamSize: 3,
        useCase: "coding",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      // Same-vendor: $40/user → $20/user for 3 users = $60 savings
      // Cross-tool: Windsurf Pro $15/user × 3 = $45, saving $75
      // Engine correctly picks the highest savings option
      expect(rec.savingsMonthly).toBeGreaterThanOrEqual(60);
      expect(rec.savingsAnnual).toBe(rec.savingsMonthly * 12);
    });

    it("finds savings when downgrading GitHub Copilot Enterprise for <10 users", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "github_copilot",
            planId: "copilot_enterprise",
            monthlySpend: 195, // 5 × $39
            seats: 5,
          },
        ],
        teamSize: 5,
        useCase: "coding",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      // Same-vendor: $39/user → $19/user for 5 users = $100 savings
      // Cross-tool: could find cheaper (Windsurf Pro $15 × 5 = $75 → $120 savings)
      expect(rec.savingsMonthly).toBeGreaterThanOrEqual(100);
      expect(rec.severity).toBe("high");
    });
  });

  // ─── Test 3: Cross-Tool Alternative ────────────────────────────────────────
  describe("Pass 3: Cross-Tool Alternatives", () => {
    it("suggests cheaper coding tool when one exists", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "cursor",
            planId: "cursor_business",
            monthlySpend: 200, // 5 × $40
            seats: 5,
          },
        ],
        teamSize: 5,
        useCase: "coding",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      expect(rec.savingsMonthly).toBeGreaterThan(0);
    });
  });

  // ─── Test 4: Redundancy Detection ─────────────────────────────────────────
  describe("Pass 3b: Redundancy Detection", () => {
    it("flags paying for both Cursor and GitHub Copilot", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "cursor",
            planId: "cursor_pro",
            monthlySpend: 20,
            seats: 1,
          },
          {
            toolId: "github_copilot",
            planId: "copilot_individual",
            monthlySpend: 10,
            seats: 1,
          },
        ],
        teamSize: 1,
        useCase: "coding",
      };

      const result = runAudit(input);

      // At least one recommendation should mention redundancy
      const hasRedundancyFlag = result.recommendations.some(
        (r) =>
          r.recommendedAction.includes("coding assistant") ||
          r.reason.includes("simultaneously")
      );

      expect(hasRedundancyFlag).toBe(true);
    });
  });

  // ─── Test 5: Credex CTA + Already Optimal Logic ──────────────────────────
  describe("Aggregate Results", () => {
    it("sets showCredexCta=true when total monthly savings > $500", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "cursor",
            planId: "cursor_business",
            monthlySpend: 2000, // 50 × $40
            seats: 50,
          },
          {
            toolId: "github_copilot",
            planId: "copilot_enterprise",
            monthlySpend: 1950, // 50 × $39
            seats: 50,
          },
        ],
        teamSize: 50,
        useCase: "coding",
      };

      const result = runAudit(input);

      expect(result.totalMonthlySavings).toBeGreaterThan(500);
      expect(result.showCredexCta).toBe(true);
    });

    it("sets alreadyOptimal=true when total savings < $100", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "cursor",
            planId: "cursor_pro",
            monthlySpend: 20,
            seats: 1,
          },
        ],
        teamSize: 1,
        useCase: "coding",
      };

      const result = runAudit(input);

      // Single user on Cursor Pro — already the best individual plan
      expect(result.alreadyOptimal).toBe(true);
    });
  });

  // ─── Test 6: API Direct / Custom Plans ────────────────────────────────────
  describe("Edge Cases", () => {
    it("handles API direct spend with Credex flag for high spend", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "anthropic_api",
            planId: "anthropic_api_direct",
            monthlySpend: 500,
            seats: 1,
          },
        ],
        teamSize: 5,
        useCase: "mixed",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      expect(rec.currentSpend).toBe(500);
      expect(rec.recommendedAction).toContain("Credex");
    });

    it("handles empty tool list gracefully", () => {
      const input: AuditFormData = {
        tools: [],
        teamSize: 1,
        useCase: "coding",
      };

      const result = runAudit(input);

      expect(result.recommendations).toHaveLength(0);
      expect(result.totalMonthlySavings).toBe(0);
      expect(result.alreadyOptimal).toBe(true);
    });

    it("calculates correct annual savings", () => {
      const input: AuditFormData = {
        tools: [
          {
            toolId: "chatgpt",
            planId: "chatgpt_team",
            monthlySpend: 30,
            seats: 1,
          },
        ],
        teamSize: 1,
        useCase: "writing",
      };

      const result = runAudit(input);
      const rec = result.recommendations[0];

      expect(rec.savingsAnnual).toBe(rec.savingsMonthly * 12);
    });
  });
});
