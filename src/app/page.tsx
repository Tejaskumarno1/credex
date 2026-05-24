"use client";

import { useState, useRef } from "react";
import SpendForm from "@/components/SpendForm";
import AuditResults from "@/components/AuditResults";
import LeadCapture from "@/components/LeadCapture";
import ShareButton from "@/components/ShareButton";
import type { AuditResult, UseCase } from "@/lib/auditEngine";

const PLATFORM_LOGOS = [
  { name: "OpenAI", abbr: "OAI" },
  { name: "AWS", abbr: "AWS" },
  { name: "Google Cloud", abbr: "GCP" },
  { name: "Anthropic", abbr: "ANT" },
  { name: "Cursor", abbr: "CUR" },
  { name: "GitHub", abbr: "GH" },
];

export default function HomePage() {
  const [auditState, setAuditState] = useState<{
    result: AuditResult;
    summary: string;
    isAiFallback: boolean;
    auditId: string;
    teamSize: number;
    tools: { toolId: string; planId: string; monthlySpend: number; seats: number }[];
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
        tools: data.tools,
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
    <main className="min-h-screen bg-[#F4F4F4]">
      {/* ────────────────── Navigation ────────────────── */}
      <nav className="credex-glass sticky top-0 z-[9999] border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00251A] shadow-lg shadow-[#00251A]/20 flex items-center justify-center">
              <span className="text-[#0FF395] font-extrabold text-sm tracking-tight">S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#1A1A1A]">SpendLens</span>
              <span className="text-zinc-300 font-light">|</span>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#086841] hover:text-[#0FF395] transition-colors duration-300"
              >
                credex
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00251A] text-[#0FF395] text-xs font-semibold tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0FF395] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0FF395]" />
              </span>
              Save up to 50%
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#0FF395] text-[#00251A] text-sm font-semibold hover:bg-[#0FF395]/90 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#0FF395]/20"
            >
              Get Credits
            </a>
          </div>
        </div>
      </nav>

      {/* ────────────────── Hero Section ────────────────── */}
      <section className="relative overflow-hidden bg-white credex-grid-bg">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0FF395]/8 rounded-full blur-[100px] credex-glow pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-[#FF6B4A]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-[#00251A]/3 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-20 md:pt-28 pb-20">
          <div className="text-center space-y-8 mb-16 credex-stagger">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00251A] text-sm font-semibold tracking-wide shadow-lg shadow-[#00251A]/10">
              <span className="h-2 w-2 rounded-full bg-[#0FF395] animate-pulse" />
              <span className="text-[#0FF395]">Free AI spend audit tool</span>
              <span className="text-zinc-400">•</span>
              <span className="text-white/70">by Credex</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[0.95] text-[#1A1A1A]">
              Stop overpaying
              <br />
              for{" "}
              <span className="credex-text-gradient">
                AI tools
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Audit your team&apos;s AI spend in 2 minutes. Get personalized
              recommendations to cut costs — then buy discounted credits through{" "}
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#086841] font-semibold hover:text-[#0FF395] transition-colors border-b border-[#086841]/30 hover:border-[#0FF395]/50"
              >
                Credex
              </a>
              .
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-zinc-600 pt-2">
              {["100% free", "No sign-up required", "Data stays local"].map((badge) => (
                <span key={badge} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#0FF395]/15 flex items-center justify-center">
                    <svg className="h-3 w-3 text-[#086841]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Platform logos strip */}
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap credex-slide-up" style={{ animationDelay: "0.4s" }}>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mr-2">
              Supported platforms
            </span>
            {PLATFORM_LOGOS.map((platform) => (
              <div
                key={platform.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100/80 border border-zinc-200/60 text-zinc-500 text-xs font-semibold hover:border-[#0FF395]/30 hover:text-[#086841] hover:bg-[#0FF395]/5 transition-all duration-300 cursor-default"
              >
                <span className="h-5 w-5 rounded bg-zinc-200/60 flex items-center justify-center text-[9px] font-bold text-zinc-600">
                  {platform.abbr.charAt(0)}
                </span>
                {platform.name}
              </div>
            ))}
          </div>
        </div>

        {/* Section divider with accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#0FF395]/30 to-transparent" />
      </section>

      {/* ────────────────── Form Section ────────────────── */}
      <section className="relative z-0 max-w-4xl mx-auto px-4 md:px-8 py-20">
        <SpendForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-sm font-semibold text-center shadow-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}
      </section>

      {/* ────────────────── Results Section ────────────────── */}
      {auditState && (
        <section
          ref={resultsRef}
          className="relative z-0 max-w-4xl mx-auto px-4 md:px-8 pb-24 pt-12"
        >
          {/* Green accent divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#0FF395]/40 to-transparent mb-12" />

          <div className="flex items-center justify-between mb-8">
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
          <div className="mt-12">
            <LeadCapture
              auditId={auditState.auditId}
              totalSavingsMonthly={auditState.result.totalMonthlySavings}
              totalSavingsAnnual={auditState.result.totalAnnualSavings}
              summary={auditState.summary}
              teamSize={auditState.teamSize}
              tools={auditState.tools}
            />
          </div>
        </section>
      )}

      {/* ────────────────── How Credex Works Section ────────────────── */}
      <section className="bg-[#00251A] relative overflow-hidden credex-grid-bg-dark">
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-[#0FF395]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-[#0FF395]/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-24">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0FF395]/20 bg-[#0FF395]/10 text-[#0FF395] text-xs font-bold uppercase tracking-widest">
              How Credex Works
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Buy & sell unused AI credits
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Companies over-purchase AI credits. Startups need them at a discount.
              Credex connects both — saving buyers up to <span className="text-[#0FF395] font-bold">50%</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 credex-stagger">
            {[
              {
                step: "01",
                title: "Audit Your Spend",
                desc: "Use SpendLens to identify exactly where you're overpaying across AI tools and cloud services.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Get Discounted Credits",
                desc: "Credex sources verified credits from companies that over-forecasted — OpenAI, AWS, GCP, Anthropic & more.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Secure Transfer",
                desc: "NDA-protected transactions with escrow payment, ownership verification, and 24×7 support.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-2xl border border-[#0FF395]/10 bg-[#0FF395]/[0.03] hover:bg-[#0FF395]/[0.06] hover:border-[#0FF395]/20 transition-all duration-500 credex-card-hover group"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-[#0FF395]/10 border border-[#0FF395]/20 flex items-center justify-center text-[#0FF395] group-hover:bg-[#0FF395]/20 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[#0FF395]/40 text-sm font-bold tracking-widest">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#0FF395] text-[#00251A] font-bold text-lg shadow-lg shadow-[#0FF395]/20 hover:shadow-xl hover:shadow-[#0FF395]/30 hover:bg-[#0FF395]/90 transition-all duration-300 active:scale-[0.98]"
            >
              Explore Credex Credits
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────── Guarantees Strip ────────────────── */}
      <section className="bg-white border-y border-zinc-200/60">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {[
              { icon: "🔒", title: "Vendor Verified", desc: "Every account audited before listing" },
              { icon: "🛡️", title: "Escrow Protected", desc: "Payments held securely until transfer" },
              { icon: "📋", title: "NDA Secured", desc: "Mutual NDAs protect both parties" },
              { icon: "📞", title: "24×7 Support", desc: "Technical & billing help anytime" },
            ].map((item) => (
              <div key={item.title} className="text-center space-y-3 group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="font-bold text-[#1A1A1A]">{item.title}</h3>
                <p className="text-sm text-zinc-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── Footer ────────────────── */}
      <footer className="bg-[#00251A] text-white relative overflow-hidden">
        <div className="absolute inset-0 credex-grid-bg-dark opacity-50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#0FF395] flex items-center justify-center">
                  <span className="text-[#00251A] font-extrabold text-sm">S</span>
                </div>
                <div>
                  <span className="font-bold text-lg">SpendLens</span>
                  <p className="text-xs text-zinc-400">by Credex</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Free AI spend audit tool built by Credex — the trusted marketplace for buying & selling unused AI and cloud credits.
              </p>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#0FF395]">Company</h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p className="font-medium text-white/80">Dreadnought Technology Pvt. Ltd.</p>
                <p>DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai</p>
                <p>WeWork, DLF Forum, Cyber City Phase-III, Gurgaon - 122002</p>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#0FF395]">Connect</h4>
              <div className="space-y-3 text-sm">
                <a href="mailto:team@credex.rocks" className="flex items-center gap-2 text-zinc-400 hover:text-[#0FF395] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  team@credex.rocks
                </a>
                <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-400 hover:text-[#0FF395] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  credex.rocks
                </a>
                <a href="https://www.linkedin.com/company/credex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-400 hover:text-[#0FF395] transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} SpendLens by{" "}
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-[#0FF395] hover:text-white transition-colors">
                Credex
              </a>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://credex.rocks/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#0FF395] transition-colors">Terms</a>
              <a href="https://credex.rocks/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#0FF395] transition-colors">Privacy</a>
              <a href="https://credex.rocks/refund" target="_blank" rel="noopener noreferrer" className="hover:text-[#0FF395] transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
