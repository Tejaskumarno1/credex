"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Trophy, Coins, Check } from "lucide-react";
import type { AuditResult, Severity } from "@/lib/auditEngine";

interface AuditResultsProps {
  result: AuditResult;
  summary: string;
  isAiFallback: boolean;
  auditId: string;
}

const severityConfig: Record<
  Severity,
  { color: string; bgColor: string; label: string; icon: React.ReactNode }
> = {
  high: {
    color: "text-red-600",
    bgColor: "bg-red-50 text-red-700 border-red-200/60",
    label: "High Savings",
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
  medium: {
    color: "text-amber-600",
    bgColor: "bg-amber-50 text-amber-700 border-amber-200/60",
    label: "Medium Savings",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />,
  },
  low: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    label: "Low Savings",
    icon: <Info className="w-3 h-3 mr-1" />,
  },
  optimal: {
    color: "text-[#086841]",
    bgColor: "bg-[#0FF395]/10 text-[#086841] border-[#0FF395]/30",
    label: "Optimal",
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
};

export default function AuditResults({
  result,
  summary,
  isAiFallback,
  auditId,
}: AuditResultsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" id="audit-results">
      {/* Hero Section — Big Bold Numbers */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00251A] text-[#0FF395] text-xs font-bold tracking-widest uppercase shadow-lg shadow-[#00251A]/10">
          <Check className="w-3.5 h-3.5" />
          Audit Complete
        </div>

        {result.alreadyOptimal ? (
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
              You&apos;re spending{" "}
              <span className="credex-text-gradient">
                wisely
              </span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed font-medium">
              Your AI stack is already efficient. Small tweaks might save a bit,
              but you&apos;re in good shape.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
              You could save{" "}
              <span className="credex-text-gradient">
                ${result.totalMonthlySavings.toLocaleString()}/month
              </span>
            </h2>
            <p className="text-2xl font-bold text-zinc-400">
              ${result.totalAnnualSavings.toLocaleString()}
              <span className="text-lg font-semibold">/year</span>
            </p>
          </div>
        )}

        {/* Current Spend Context */}
        <div className="flex items-center justify-center gap-4 md:gap-6 text-sm font-semibold flex-wrap">
          <div className="bg-white px-5 py-2.5 rounded-xl border border-zinc-200/80 shadow-sm text-zinc-500">
            Current spend:{" "}
            <span className="text-[#1A1A1A] font-bold">
              ${result.totalCurrentSpend.toLocaleString()}/mo
            </span>
          </div>
          {!result.alreadyOptimal && (
            <>
              <span className="text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="bg-[#0FF395]/10 px-5 py-2.5 rounded-xl border border-[#0FF395]/20 shadow-sm text-[#086841]">
                Optimized:{" "}
                <span className="font-bold">
                  $
                  {(
                    result.totalCurrentSpend - result.totalMonthlySavings
                  ).toLocaleString()}
                  /mo
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

      {/* AI Summary */}
      <Card className="bg-white border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#0FF395] via-[#086841] to-[#0FF395]" />
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#00251A] flex items-center justify-center text-[#0FF395] text-sm font-bold shrink-0 shadow-md shadow-[#00251A]/20">
              AI
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-[#1A1A1A]">Personalized Analysis</h3>
                {isAiFallback && (
                  <Badge variant="secondary" className="text-[10px] bg-zinc-100 text-zinc-500 border-none font-semibold rounded-md">
                    Template Summary
                  </Badge>
                )}
              </div>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Tool Breakdown */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-extrabold text-[#1A1A1A]" id="breakdown-heading">Tool-by-Tool Breakdown</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent" />
        </div>
        <div className="grid gap-3 credex-stagger">
          {result.recommendations.map((rec) => {
            const config = severityConfig[rec.severity];
            return (
              <Card
                key={rec.toolId}
                className="bg-white border-zinc-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300 credex-card-hover"
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-[#1A1A1A]">{rec.toolName}</h4>
                        <Badge variant="outline" className="text-xs bg-white border-zinc-200 text-zinc-500 font-semibold rounded-md">
                          {rec.currentPlan}
                        </Badge>
                        <Badge
                          className={`text-[11px] px-2.5 py-0.5 font-semibold flex items-center border rounded-md ${config.bgColor}`}
                          variant="secondary"
                        >
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">{rec.reason}</p>
                      {rec.severity !== "optimal" && (
                        <p className="text-sm font-semibold text-[#086841] flex items-center gap-2 mt-1">
                          <span className="h-5 w-5 rounded-full bg-[#0FF395]/15 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[#086841]" />
                          </span>
                          {rec.recommendedAction}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-8 text-right shrink-0">
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current</p>
                        <p className="font-bold text-[#1A1A1A]">${rec.currentSpend.toLocaleString()}/mo</p>
                      </div>
                      {rec.savingsMonthly > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Savings</p>
                          <p className={`font-bold ${config.color}`}>
                            -${rec.savingsMonthly.toLocaleString()}/mo
                          </p>
                          <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                            -${rec.savingsAnnual.toLocaleString()}/yr
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Credex CTA (conditional) */}
      {result.showCredexCta && (
        <Card className="bg-[#00251A] border-none shadow-xl overflow-hidden relative text-white">
          <div className="absolute inset-0 credex-grid-bg-dark opacity-60" />
          <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-[#0FF395]/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[150px] bg-[#0FF395]/5 rounded-full blur-[60px] pointer-events-none" />

          <CardContent className="pt-12 pb-12 relative">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0FF395]/10 border border-[#0FF395]/20 text-[#0FF395] text-xs font-bold uppercase tracking-widest">
                <Coins className="w-3.5 h-3.5" /> Exclusive for high-spend teams
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">
                Ready to capture{" "}
                <span className="text-[#0FF395]">
                  ${result.totalMonthlySavings.toLocaleString()}/month
                </span>{" "}
                in savings?
              </h3>
              <p className="text-zinc-300 text-lg leading-relaxed">
                Credex sells discounted AI credits from companies that
                overforecast. Book a free 15-minute consultation to see how much
                your team could save.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a
                  href="https://calendly.com/credex/consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="credex-cta-button"
                >
                  <button className="px-8 py-4 bg-[#0FF395] hover:bg-[#0FF395]/90 text-[#00251A] font-bold rounded-xl shadow-lg shadow-[#0FF395]/20 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-[#0FF395]/30 active:scale-[0.98] text-base">
                    Book a Credex Consultation →
                  </button>
                </a>
                <a
                  href={`mailto:hello@credex.rocks?subject=SpendLens Audit — $${result.totalMonthlySavings.toLocaleString()}/mo savings&body=Hi Credex team, I just ran a SpendLens audit and found $${result.totalMonthlySavings.toLocaleString()}/month in potential savings. I'd love to learn more about discounted AI credits. My audit: ${typeof window !== "undefined" ? window.location.origin : ""}/audit/${auditId}`}
                  className="text-sm font-semibold text-zinc-400 hover:text-[#0FF395] transition-colors duration-300 flex items-center gap-1.5"
                >
                  or email us
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal State Message */}
      {result.alreadyOptimal && (
        <Card className="bg-white border-[#0FF395]/30 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#0FF395] to-[#086841]" />
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <Trophy className="w-14 h-14 mx-auto text-[#0FF395] mb-2" />
            <h3 className="text-2xl font-extrabold text-[#086841]">
              Your AI stack is well-optimized
            </h3>
            <p className="text-zinc-500 max-w-md mx-auto leading-relaxed font-medium">
              No major changes needed. Sign up below to get notified when pricing
              changes could affect your stack, or when new tools offer better value.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
