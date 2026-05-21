import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicAuditView from "./PublicAuditView";

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
      title: "Audit Not Found — SpendLens",
      description: "This audit could not be found.",
    };
  }

  const savingsText = `$${Math.round(audit.savings_monthly).toLocaleString()}/month`;
  const summaryFirst = audit.summary_text?.split(". ")[0] || "AI spend audit results";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://spendlens.dev";
  const ogImageUrl = `${baseUrl}/api/og?savings=${Math.round(audit.savings_monthly)}&annual=${Math.round(audit.savings_annual)}&team=${audit.team_size}&tools=${encodeURIComponent(audit.use_case || "AI tools")}`;

  return {
    title: `I could save ${savingsText} on AI tools — SpendLens`,
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-6xl">🔍</p>
          <h1 className="text-2xl font-bold">Audit Not Found</h1>
          <p className="text-muted-foreground">
            This audit may have expired or the link is incorrect.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-lg"
          >
            Run Your Own Audit →
          </a>
        </div>
      </main>
    );
  }

  return <PublicAuditView audit={audit} auditId={id} />;
}
