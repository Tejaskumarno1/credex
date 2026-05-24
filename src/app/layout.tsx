import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit | by Credex",
  description:
    "Audit your team's AI tool spend in 2 minutes. Get personalized recommendations to cut costs on Cursor, Copilot, Claude, ChatGPT, and more. Save up to 50% on AI credits through Credex.",
  keywords: [
    "AI spend audit",
    "AI tool costs",
    "startup savings",
    "Cursor pricing",
    "GitHub Copilot pricing",
    "Claude pricing",
    "ChatGPT pricing",
    "AI budget",
    "AI cost optimization",
    "buy AI credits",
    "sell cloud credits",
    "Credex",
    "OpenAI credits",
    "AWS credits",
  ],
  authors: [{ name: "Credex", url: "https://credex.rocks" }],
  openGraph: {
    title: "SpendLens — Free AI Spend Audit | by Credex",
    description:
      "Audit your team's AI tool spend in 2 minutes. Find savings across Cursor, Copilot, Claude, ChatGPT and more. Save up to 50% with Credex.",
    type: "website",
    siteName: "SpendLens by Credex",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit | by Credex",
    description:
      "Audit your team's AI tool spend in 2 minutes. Find savings across Cursor, Copilot, Claude, ChatGPT and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F4F4] text-[#1A1A1A] selection:bg-[#0FF39540] selection:text-[#00251A]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
