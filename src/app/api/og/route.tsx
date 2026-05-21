/**
 * Dynamic OG Image Generation
 * 
 * Generates personalized Open Graph images for shared audit pages
 * using Next.js ImageResponse (built on @vercel/og).
 */

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const savings = searchParams.get("savings") || "0";
  const annual = searchParams.get("annual") || "0";
  const tools = searchParams.get("tools") || "AI tools";
  const teamSize = searchParams.get("team") || "1";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(34,211,238,0.12), transparent 50%), radial-gradient(ellipse at bottom right, rgba(167,139,250,0.08), transparent 50%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#e5e5e5",
              letterSpacing: "-0.02em",
            }}
          >
            SpendLens
          </span>
        </div>

        {/* Savings Number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              color: "#a1a1aa",
            }}
          >
            Potential monthly savings
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
            }}
          >
            ${parseInt(savings).toLocaleString()}/mo
          </span>
          <span
            style={{
              fontSize: "28px",
              color: "#a78bfa",
            }}
          >
            ${parseInt(annual).toLocaleString()}/year
          </span>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "16px",
            color: "#71717a",
          }}
        >
          <span>{teamSize}-person team</span>
          <span>•</span>
          <span>{tools}</span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#52525b",
          }}
        >
          <span>Free AI spend audit tool by</span>
          <span style={{ color: "#a78bfa" }}>Credex</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
