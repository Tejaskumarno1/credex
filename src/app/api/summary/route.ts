/**
 * POST /api/summary
 *
 * Standalone endpoint for regenerating AI summaries.
 * Useful if the initial summary failed or user wants a fresh one.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/anthropic";
import type { AuditResult, UseCase } from "@/lib/auditEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { auditResult, useCase, teamSize, toolNames } = body as {
      auditResult: AuditResult;
      useCase: UseCase;
      teamSize: number;
      toolNames: string[];
    };

    if (!auditResult || !useCase || !teamSize || !toolNames) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { summary, isAiFallback } = await generateSummary({
      auditResult,
      useCase,
      teamSize,
      toolNames,
    });

    return NextResponse.json({ summary, isAiFallback });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
