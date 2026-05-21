"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ShareButton from "@/components/ShareButton";
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

const severityColors = {
  high: "bg-red-500/10 border-red-500/20 text-red-400",
  medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  low: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  optimal: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
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
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SpendLens</span>
          </a>
          <ShareButton auditId={auditId} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-xs">
            Shared Audit Report • {new Date(audit.created_at).toLocaleDateString()}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {result.alreadyOptimal ? (
              <>
                This team is spending{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  wisely
                </span>
              </>
            ) : (
              <>
                Potential savings:{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  ${Math.round(audit.savings_monthly).toLocaleString()}/mo
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-muted-foreground">
            ${Math.round(audit.savings_annual).toLocaleString()}/year •{" "}
            {audit.team_size}-person team • {audit.use_case}
          </p>
        </div>

        <Separator className="opacity-30" />

        {/* AI Summary */}
        {audit.summary_text && (
          <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-cyan-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  AI
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Analysis Summary</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {audit.summary_text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tool Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Tool Breakdown</h2>
          <div className="grid gap-3">
            {result.recommendations.map((rec) => (
              <Card
                key={rec.toolId}
                className={`border ${severityColors[rec.severity]}`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rec.toolName}</h3>
                        <Badge variant="outline" className="text-xs">{rec.currentPlan}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      {rec.severity !== "optimal" && (
                        <p className="text-sm font-medium text-cyan-400">→ {rec.recommendedAction}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${rec.currentSpend.toLocaleString()}/mo</p>
                      {rec.savingsMonthly > 0 && (
                        <p className="text-emerald-400 text-sm font-medium">
                          Save ${rec.savingsMonthly.toLocaleString()}/mo
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-border/50 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Want to audit your own AI spend?</h2>
            <p className="text-muted-foreground">
              Get personalized recommendations in 2 minutes. 100% free, no sign-up.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
              id="run-own-audit-cta"
            >
              Run Your Own Audit →
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a href="https://credex.rocks" className="text-foreground hover:text-cyan-400 transition-colors" target="_blank" rel="noopener noreferrer">
              Credex
            </a>{" "}
            — Discounted AI infrastructure credits for startups
          </p>
        </div>
      </footer>
    </main>
  );
}
