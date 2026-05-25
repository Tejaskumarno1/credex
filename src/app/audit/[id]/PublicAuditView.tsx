"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { runAudit, type AuditFormData, type ToolInput } from "@/lib/auditEngine";

interface PublicAuditViewProps {
  audit: {
    id: string;
    tools_json: ToolInput[];
    use_case: string;
    team_size: number;
    savings_monthly: number;
    savings_annual: number;
    summary_text: string | null;
    created_at: string;
  };
  auditId: string;
}

// We remove severityColors for card outer wrapper as it's now uniform.
// But we still need something to determine the badge color or we can inline it like we did in AuditResults.
const severityBadgeColors = {
  high: "bg-red-50 text-red-700 border-red-200/60",
  medium: "bg-amber-50 text-amber-700 border-amber-200/60",
  low: "bg-blue-50 text-blue-700 border-blue-200/60",
  optimal: "bg-[#0FF395]/10 text-[#086841] border-[#0FF395]/30",
};

export default function PublicAuditView({ audit, auditId }: PublicAuditViewProps) {
  // Re-run the audit engine client-side to get full recommendations
  const formData: AuditFormData = {
    tools: audit.tools_json,
    teamSize: audit.team_size,
    useCase: audit.use_case as AuditFormData["useCase"],
  };
  const result = runAudit(formData);

  return (
    <main className="min-h-screen bg-[#F4F4F4] selection:bg-[#0FF39540] selection:text-[#00251A]">
      {/* Nav */}
      <nav className="credex-glass sticky top-0 z-50 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-[#00251A] shadow-lg shadow-[#00251A]/20 flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
              <span className="text-[#0FF395] font-extrabold text-sm">S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#1A1A1A]">SpendLens</span>
              <span className="text-zinc-300 font-light">|</span>
              <span className="text-sm font-semibold text-[#086841]">credex</span>
            </div>
          </Link>
          <ShareButton auditId={auditId} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-5 credex-slide-up">
          <Badge variant="secondary" className="text-xs bg-[#00251A] text-[#0FF395] border-none shadow-md font-bold px-4 py-1.5 rounded-full">
            Shared Audit Report • {new Date(audit.created_at).toLocaleDateString()}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
            {result.alreadyOptimal ? (
              <>
                This team is spending{" "}
                <span className="credex-text-gradient">
                  wisely
                </span>
              </>
            ) : (
              <>
                Potential savings:{" "}
                <span className="credex-text-gradient">
                  ${Math.round(audit.savings_monthly).toLocaleString()}/mo
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-zinc-500 font-semibold">
            ${Math.round(audit.savings_annual).toLocaleString()}/year •{" "}
            {audit.team_size}-person team • {audit.use_case}
          </p>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#0FF395]/30 to-transparent" />

        {/* AI Summary */}
        {audit.summary_text && (
          <Card className="bg-white border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#0FF395] via-[#086841] to-[#0FF395]" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#00251A] flex items-center justify-center text-[#0FF395] text-sm font-bold shrink-0 shadow-md shadow-[#00251A]/20">
                  AI
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2 text-[#1A1A1A]">Analysis Summary</h3>
                  <p className="text-zinc-600 leading-relaxed text-sm">
                    {audit.summary_text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tool Breakdown */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Tool Breakdown</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent" />
          </div>
          <div className="grid gap-3 credex-stagger">
            {result.recommendations.map((rec) => (
              <Card
                key={rec.toolId}
                className="bg-white border-zinc-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300 credex-card-hover"
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-[#1A1A1A]">{rec.toolName}</h3>
                        <Badge variant="outline" className="text-xs bg-white border-zinc-200 text-zinc-500 font-semibold rounded-md">{rec.currentPlan}</Badge>
                        <Badge variant="secondary" className={`text-[11px] px-2.5 py-0.5 font-semibold flex items-center border rounded-md ${severityBadgeColors[rec.severity]}`}>
                          {rec.severity === "optimal" ? "Optimal" : `${rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)} Savings`}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">{rec.reason}</p>
                      {rec.severity !== "optimal" && (
                        <p className="text-sm font-semibold text-[#086841] flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-[#0FF395]/15 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-[#086841]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {rec.recommendedAction}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current</p>
                      <p className="font-bold text-[#1A1A1A]">${rec.currentSpend.toLocaleString()}/mo</p>
                      {rec.savingsMonthly > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Savings</p>
                          <p className="font-bold text-[#086841]">
                            -${rec.savingsMonthly.toLocaleString()}/mo
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-[#00251A] border-none shadow-xl overflow-hidden relative text-white">
          <div className="absolute inset-0 credex-grid-bg-dark opacity-60" />
          <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-[#0FF395]/8 rounded-full blur-[80px] pointer-events-none" />
          <CardContent className="pt-12 pb-12 relative text-center space-y-5 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Want to audit your own AI spend?</h2>
            <p className="text-zinc-400 text-lg font-medium">
              Get personalized recommendations in 2 minutes. 100% free, no sign-up.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 px-8 py-4 bg-[#0FF395] hover:bg-[#0FF395]/90 text-[#00251A] font-bold rounded-xl shadow-lg shadow-[#0FF395]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#0FF395]/30 active:scale-[0.98] text-base"
              id="run-own-audit-cta"
            >
              Run Your Own Audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-[#00251A] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-zinc-400">
          <p>
            Powered by{" "}
            <a href="https://credex.rocks" className="text-[#0FF395] hover:text-white transition-colors duration-300 font-bold" target="_blank" rel="noopener noreferrer">
              Credex
            </a>{" "}
            — Discounted AI infrastructure credits for startups
          </p>
          <a href="mailto:team@credex.rocks" className="hover:text-[#0FF395] transition-colors duration-300">
            team@credex.rocks
          </a>
        </div>
      </footer>
    </main>
  );
}
