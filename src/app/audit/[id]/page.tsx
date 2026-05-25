import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicAuditView from "./PublicAuditView";
import Link from "next/link";
interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAudit(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch audit:", error);
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return {
      title: "Audit Not Found — SpendLens by Credex",
      description: "This audit could not be found.",
    };
  }

  const savingsText = `$${Math.round(audit.savings_monthly).toLocaleString()}/month`;
  const summaryFirst = audit.summary_text?.split(". ")[0] || "AI spend audit results";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://spendlens.dev";
  const ogImageUrl = `${baseUrl}/api/og?savings=${Math.round(audit.savings_monthly)}&annual=${Math.round(audit.savings_annual)}&team=${audit.team_size}&tools=${encodeURIComponent(audit.use_case || "AI tools")}`;

  return {
    title: `I could save ${savingsText} on AI tools — SpendLens by Credex`,
    description: summaryFirst,
    openGraph: {
      title: `I could save ${savingsText} on AI tools — see my audit`,
      description: summaryFirst,
      type: "website",
      url: `${baseUrl}/audit/${id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `SpendLens audit: save ${savingsText} on AI tools`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `I could save ${savingsText} on AI tools — see my audit`,
      description: summaryFirst,
      images: [ogImageUrl],
    },
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return (
      <main className="min-h-screen bg-[#F4F4F4] flex items-center justify-center relative credex-grid-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#0FF395]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative text-center space-y-6 max-w-md px-6">
          <div className="h-20 w-20 rounded-2xl bg-[#00251A] shadow-xl shadow-[#00251A]/20 flex items-center justify-center mx-auto">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Audit Not Found</h1>
          <p className="text-zinc-500 font-medium leading-relaxed">
            This audit may have expired or the link is incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-8 py-4 bg-[#0FF395] text-[#00251A] font-bold rounded-xl shadow-lg shadow-[#0FF395]/20 hover:shadow-xl hover:shadow-[#0FF395]/30 transition-all duration-300 active:scale-[0.98]"
          >
            Run Your Own Audit
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return <PublicAuditView audit={audit} auditId={id} />;
}
