/**
 * POST /api/lead
 *
 * Saves lead capture data to Supabase and sends a transactional email via Resend.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check
    if (body.company_website) {
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    const { email, auditId, totalSavingsMonthly, totalSavingsAnnual, summary, tools } = body;
    if (!email || !auditId) {
      return NextResponse.json(
        { error: "Email and audit ID are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const isHighSavings = (totalSavingsMonthly || 0) > 500;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://spendlens.dev";
    const auditUrl = `${baseUrl}/audit/${auditId}`;

    // Save to Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("audit_leads").insert({
          audit_id: auditId,
          email,
          company_name: body.companyName || null,
          role: body.role || null,
          team_size: body.teamSize || null,
          is_high_savings: isHighSavings,
        });

        if (error) {
          console.error("Lead save error:", error);
        }
      }
    } catch (dbError) {
      console.error("Lead database save failed:", dbError);
    }

    // Send email via Resend
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { sendAuditEmail } = await import("@/lib/resend");
        await sendAuditEmail({
          to: email,
          totalSavingsMonthly: totalSavingsMonthly || 0,
          totalSavingsAnnual: totalSavingsAnnual || 0,
          summary: summary || "Your AI spend audit is ready.",
          auditUrl,
          isHighSavings,
          tools: tools || [],
        });
      }
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, auditUrl });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
