"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadCaptureProps {
  auditId: string;
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  summary: string;
  teamSize: number;
}

export default function LeadCapture({
  auditId,
  totalSavingsMonthly,
  totalSavingsAnnual,
  summary,
  teamSize,
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
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-6 pb-6 text-center space-y-3">
          <p className="text-4xl">📧</p>
          <h3 className="text-lg font-semibold text-emerald-400">Report saved!</h3>
          <p className="text-sm text-muted-foreground">
            Check your inbox for a summary of your audit results and a link to your
            shareable report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-accent/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📋 Save Your Report
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get a copy emailed to you with a shareable link. No spam, ever.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-email" className="text-sm">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead-company" className="text-sm">
                Company
              </Label>
              <Input
                id="lead-company"
                type="text"
                placeholder="Optional"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-role" className="text-sm">
                Role
              </Label>
              <Input
                id="lead-role"
                type="text"
                placeholder="Optional"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-background/50"
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
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-semibold"
            disabled={!email || isSubmitting}
            id="save-report-button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              "Save & Email My Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
