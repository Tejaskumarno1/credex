"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, ClipboardList } from "lucide-react";

interface LeadCaptureProps {
  auditId: string;
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  summary: string;
  teamSize: number;
  tools: { toolId: string; planId: string; seats: number; monthlySpend: number }[];
}

export default function LeadCapture({
  auditId,
  totalSavingsMonthly,
  totalSavingsAnnual,
  summary,
  teamSize,
  tools,
}: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (honeypot) return; // Bot detected

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          teamSize,
          auditId,
          totalSavingsMonthly,
          totalSavingsAnnual,
          summary,
          tools,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-white border-[#0FF395]/30 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#0FF395] to-[#086841]" />
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#0FF395]/15 flex items-center justify-center mx-auto">
            <MailCheck className="w-7 h-7 text-[#086841]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#086841]">Report saved!</h3>
          <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed font-medium">
            Check your inbox for a summary of your audit results and a link to your
            shareable report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-zinc-200/80 shadow-sm overflow-hidden credex-card-hover">
      <div className="h-1 bg-gradient-to-r from-[#0FF395]/40 via-[#0FF395] to-[#0FF395]/40" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-extrabold text-[#1A1A1A] flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#00251A] flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-[#0FF395]" />
          </div>
          Save Your Report
        </CardTitle>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Get a copy emailed to you with a shareable link. No spam, ever.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-email" className="text-sm font-semibold text-[#1A1A1A]">
              Email <span className="text-[#FF6B4A]">*</span>
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#F4F4F4] border-zinc-200 shadow-sm focus-visible:ring-[#0FF395] focus-visible:border-[#0FF395] rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead-company" className="text-sm font-semibold text-[#1A1A1A]">
                Company
              </Label>
              <Input
                id="lead-company"
                type="text"
                placeholder="Optional"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-[#F4F4F4] border-zinc-200 shadow-sm focus-visible:ring-[#0FF395] focus-visible:border-[#0FF395] rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-role" className="text-sm font-semibold text-[#1A1A1A]">
                Role
              </Label>
              <Input
                id="lead-role"
                type="text"
                placeholder="Optional"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#F4F4F4] border-zinc-200 shadow-sm focus-visible:ring-[#0FF395] focus-visible:border-[#0FF395] rounded-xl h-11"
              />
            </div>
          </div>

          {/* Honeypot — hidden from real users */}
          <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
            <input
              type="text"
              name="company_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {error && (
            <p className="text-sm text-[#FF6B4A] font-semibold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#00251A] hover:bg-[#00251A]/90 text-white font-bold shadow-md shadow-[#00251A]/10 transition-all duration-300 rounded-xl h-12 text-base hover:shadow-lg active:scale-[0.99]"
            disabled={!email || isSubmitting}
            id="save-report-button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                Saving...
              </span>
            ) : (
              <>
                Save & Email My Report
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
