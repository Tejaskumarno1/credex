"use client";

import { useState, useRef } from "react";
import SpendForm from "@/components/SpendForm";
import AuditResults from "@/components/AuditResults";
import LeadCapture from "@/components/LeadCapture";
import ShareButton from "@/components/ShareButton";
import type { AuditResult, UseCase } from "@/lib/auditEngine";

export default function HomePage() {
  const [auditState, setAuditState] = useState<{
    result: AuditResult;
    summary: string;
    isAiFallback: boolean;
    auditId: string;
    teamSize: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (data: {
    tools: { toolId: string; planId: string; monthlySpend: number; seats: number }[];
    teamSize: number;
    useCase: UseCase;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to run audit");
      }

      const result = await response.json();
      setAuditState({
        result: result.result,
        summary: result.summary,
        isAiFallback: result.isAiFallback,
        auditId: result.id,
        teamSize: data.teamSize,
      });

      // Scroll to results after a brief delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SpendLens</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              by Credex
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(167,139,250,0.06),transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-8">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border/50 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Free AI spend audit tool for startups
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Stop overpaying for{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI tools
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Audit your team&apos;s AI spend in 2 minutes. Get personalized
              recommendations to cut costs without cutting capabilities.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                No sign-up required
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Data stays local
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-12">
        <SpendForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </section>

      {/* Results Section */}
      {auditState && (
        <section
          ref={resultsRef}
          className="max-w-4xl mx-auto px-4 md:px-8 pb-24 pt-8 border-t border-border/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="sr-only">Audit Results</h2>
            <ShareButton auditId={auditState.auditId} />
          </div>

          <AuditResults
            result={auditState.result}
            summary={auditState.summary}
            isAiFallback={auditState.isAiFallback}
            auditId={auditState.auditId}
          />

          {/* Lead Capture — after value delivery */}
          <div className="mt-8">
            <LeadCapture
              auditId={auditState.auditId}
              totalSavingsMonthly={auditState.result.totalMonthlySavings}
              totalSavingsAnnual={auditState.result.totalAnnualSavings}
              summary={auditState.summary}
              teamSize={auditState.teamSize}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SpendLens by{" "}
            <a
              href="https://credex.rocks"
              className="text-foreground hover:text-cyan-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Credex
            </a>
          </p>
          <p>
            Helping startups stop overpaying for AI infrastructure.
          </p>
        </div>
      </footer>
    </main>
  );
}
