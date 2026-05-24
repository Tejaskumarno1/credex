import { Resend } from "resend";
import { PRICING_DATA } from "./pricingData";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendAuditEmailParams {
  to: string;
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  summary: string;
  auditUrl: string;
  isHighSavings: boolean;
  tools: any[];
}

export async function sendAuditEmail({
  to,
  totalSavingsMonthly,
  totalSavingsAnnual,
  summary,
  auditUrl,
  isHighSavings,
  tools,
}: SendAuditEmailParams) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@spendlens.dev";

  const credexMessage = isHighSavings
    ? `\n\n💡 Based on your savings potential of $${totalSavingsMonthly.toLocaleString()}/month, a Credex specialist will be in touch to discuss discounted AI credits that could reduce your costs even further.`
    : "";

  const toolsHtmlStr = tools && tools.length > 0 ? tools.map(t => {
    const toolName = PRICING_DATA[t.toolId]?.name || t.toolId;
    const planName = PRICING_DATA[t.toolId]?.plans.find((p: any) => p.id === t.planId)?.name || t.planId;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#e5e5e5;font-size:14px;">
          <strong>${toolName}</strong>
          <div style="color:#a1a1aa;font-size:12px;margin-top:4px;">Plan: ${planName} &nbsp;•&nbsp; Seats: ${t.seats}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;color:#e5e5e5;font-size:15px;font-weight:600;">
          $${t.monthlySpend.toLocaleString()}
        </td>
      </tr>
    `;
  }).join('') : "";

  const toolsHtml = tools && tools.length > 0 ? `
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:16px;font-weight:600;margin:0 0 16px;color:#e5e5e5;">Selected Tools & Costs</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);color:#a1a1aa;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Tool</th>
            <th style="text-align:right;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);color:#a1a1aa;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Monthly Spend</th>
          </tr>
        </thead>
        <tbody>
          ${toolsHtmlStr}
        </tbody>
      </table>
    </div>
  ` : "";

  const { data, error } = await resend.emails.send({
    from: `SpendLens <${fromEmail}>`,
    to: [to],
    subject: "Your AI Spend Audit — SpendLens",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#0a0a0b;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:28px;font-weight:700;margin:0;background:linear-gradient(135deg,#22d3ee,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                SpendLens
              </h1>
              <p style="color:#a1a1aa;margin-top:8px;font-size:14px;">Your AI Spend Audit Results</p>
            </div>

            <div style="background:linear-gradient(135deg,rgba(34,211,238,0.1),rgba(167,139,250,0.1));border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
              <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px;">You could save</p>
              <p style="font-size:48px;font-weight:800;margin:0;color:#22d3ee;">
                $${totalSavingsMonthly.toLocaleString()}<span style="font-size:20px;color:#a1a1aa;">/month</span>
              </p>
              <p style="font-size:24px;color:#a78bfa;margin:8px 0 0;">
                $${totalSavingsAnnual.toLocaleString()}<span style="font-size:16px;color:#a1a1aa;">/year</span>
              </p>
            </div>

            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
              <h2 style="font-size:16px;font-weight:600;margin:0 0 12px;color:#e5e5e5;">Summary</h2>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0;">
                ${summary}
              </p>
              ${credexMessage ? `<p style="color:#22d3ee;font-size:14px;line-height:1.6;margin:12px 0 0;">${credexMessage}</p>` : ""}
            </div>

            ${toolsHtml}

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${auditUrl}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#a78bfa);color:#000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;">
                View Full Audit Report →
              </a>
            </div>

            <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;text-align:center;">
              <p style="color:#71717a;font-size:12px;margin:0;">
                Powered by <a href="https://credex.rocks" style="color:#a78bfa;text-decoration:none;">Credex</a> — Discounted AI infrastructure credits for startups
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send audit email:", error);
    throw error;
  }

  return data;
}
