import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit for Startups",
  description:
    "Audit your team's AI tool spend in 2 minutes. Get personalized recommendations to cut costs on Cursor, Copilot, Claude, ChatGPT, and more. 100% free.",
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
  ],
  authors: [{ name: "Credex", url: "https://credex.rocks" }],
  openGraph: {
    title: "SpendLens — Free AI Spend Audit for Startups",
    description:
      "Audit your team's AI tool spend in 2 minutes. Find savings across Cursor, Copilot, Claude, ChatGPT and more.",
    type: "website",
    siteName: "SpendLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit for Startups",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
