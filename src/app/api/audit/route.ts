/**
 * POST /api/audit
 *
 * Runs the audit engine on submitted form data, generates an AI summary,
 * saves to Supabase, and returns the complete audit result with a shareable ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { runAudit, type AuditFormData } from "@/lib/auditEngine";
import { generateSummary } from "@/lib/anthropic";
import { PRICING_DATA } from "@/lib/pricingData";

// In-memory rate limiting (MVP — swap to Upstash Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check — if company_website is filled, it's a bot
    if (body.company_website) {
      // Silently accept but return fake data
      return NextResponse.json({
        id: "00000000-0000-0000-0000-000000000000",
        result: { recommendations: [], totalMonthlySavings: 0, totalAnnualSavings: 0, showCredexCta: false, alreadyOptimal: true, totalCurrentSpend: 0 },
        summary: "",
        isAiFallback: true,
      });
    }

    // Validate input
    const formData = body as AuditFormData;
    if (!formData.tools || !Array.isArray(formData.tools) || !formData.teamSize || !formData.useCase) {
      return NextResponse.json(
        { error: "Invalid input. Required: tools (array), teamSize (number), useCase (string)." },
        { status: 400 }
      );
    }

    // Run audit engine
    const result = runAudit(formData);

    // Get tool names for AI summary
    const toolNames = formData.tools
      .map((t) => PRICING_DATA[t.toolId]?.name)
      .filter(Boolean) as string[];

    // Generate AI summary
    const { summary, isAiFallback } = await generateSummary({
      auditResult: result,
      useCase: formData.useCase,
      teamSize: formData.teamSize,
      toolNames,
    });

    // Save to Supabase
    let auditId = crypto.randomUUID();
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from("audits")
          .insert({
            tools_json: formData.tools,
            use_case: formData.useCase,
            team_size: formData.teamSize,
            savings_monthly: result.totalMonthlySavings,
            savings_annual: result.totalAnnualSavings,
            summary_text: summary,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else if (data) {
          auditId = data.id;
        }
      }
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      // Continue — the audit result is still valid even if DB save fails
    }

    return NextResponse.json({
      id: auditId,
      result,
      summary,
      isAiFallback,
    });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
