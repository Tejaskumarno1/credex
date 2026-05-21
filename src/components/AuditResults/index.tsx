"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AuditResult, Severity } from "@/lib/auditEngine";

interface AuditResultsProps {
  result: AuditResult;
  summary: string;
  isAiFallback: boolean;
  auditId: string;
}

const severityConfig: Record<
  Severity,
  { color: string; bgColor: string; label: string; icon: string }
> = {
  high: {
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    label: "High Savings",
    icon: "🔴",
  },
  medium: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    label: "Medium Savings",
    icon: "🟡",
  },
  low: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    label: "Low Savings",
    icon: "🔵",
  },
  optimal: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    label: "Optimal",
    icon: "✅",
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
          <span className="animate-pulse h-2 w-2 rounded-full bg-cyan-400" />
          Audit Complete
        </div>

        {result.alreadyOptimal ? (
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              You&apos;re spending{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                wisely
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Your AI stack is already efficient. Small tweaks might save a bit,
              but you&apos;re in good shape.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              You could save{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                ${result.totalMonthlySavings.toLocaleString()}/month
              </span>
            </h2>
            <p className="text-3xl font-bold text-muted-foreground">
              ${result.totalAnnualSavings.toLocaleString()}
              <span className="text-lg font-normal">/year</span>
            </p>
          </div>
        )}

        {/* Current Spend Context */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div>
            Current spend:{" "}
            <span className="text-foreground font-semibold">
              ${result.totalCurrentSpend.toLocaleString()}/mo
            </span>
          </div>
          {!result.alreadyOptimal && (
            <>
              <span>→</span>
              <div>
                Optimized:{" "}
                <span className="text-emerald-400 font-semibold">
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

      <Separator className="opacity-30" />

      {/* AI Summary */}
      <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-cyan-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              AI
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Personalized Analysis</h3>
                {isAiFallback && (
                  <Badge variant="secondary" className="text-[10px]">
                    Template Summary
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Tool Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" id="breakdown-heading">Tool-by-Tool Breakdown</h3>
        <div className="grid gap-3">
          {result.recommendations.map((rec) => {
            const config = severityConfig[rec.severity];
            return (
              <Card
                key={rec.toolId}
                className={`border transition-all hover:shadow-md ${config.bgColor}`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{rec.toolName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rec.currentPlan}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            rec.severity === "optimal"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : rec.severity === "high"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : rec.severity === "medium"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                          variant="outline"
                        >
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      {rec.severity !== "optimal" && (
                        <p className="text-sm font-medium text-cyan-400">
                          → {rec.recommendedAction}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-right shrink-0">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="font-semibold">${rec.currentSpend.toLocaleString()}/mo</p>
                      </div>
                      {rec.savingsMonthly > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Savings</p>
                          <p className={`font-bold ${config.color}`}>
                            -${rec.savingsMonthly.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">
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
        <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.15),transparent_50%)]" />
          <CardContent className="pt-8 pb-8 relative">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
                💰 Exclusive for high-spend teams
              </div>
              <h3 className="text-2xl font-bold">
                Ready to capture{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  ${result.totalMonthlySavings.toLocaleString()}/month
                </span>{" "}
                in savings?
              </h3>
              <p className="text-muted-foreground">
                Credex sells discounted AI credits from companies that
                overforecast. Book a free 15-minute consultation to see how much
                your team could save.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://calendly.com/credex/consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="credex-cta-button"
                >
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white font-semibold rounded-lg shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40 cursor-pointer">
                    Book a Credex Consultation →
                  </button>
                </a>
                <a
                  href={`mailto:hello@credex.rocks?subject=SpendLens Audit — $${result.totalMonthlySavings.toLocaleString()}/mo savings&body=Hi Credex team, I just ran a SpendLens audit and found $${result.totalMonthlySavings.toLocaleString()}/month in potential savings. I'd love to learn more about discounted AI credits. My audit: ${typeof window !== "undefined" ? window.location.origin : ""}/audit/${auditId}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  or email us →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal State Message */}
      {result.alreadyOptimal && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="pt-6 pb-6 text-center space-y-3">
            <p className="text-4xl">🏆</p>
            <h3 className="text-lg font-semibold text-emerald-400">
              Your AI stack is well-optimized
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No major changes needed. Sign up below to get notified when pricing
              changes could affect your stack, or when new tools offer better value.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
