import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Client-side Supabase client (uses anon key) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Server-side Supabase client (uses service role key for full DB access) */
export function getServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface AuditRow {
  id: string;
  tools_json: Record<string, unknown>;
  use_case: string;
  team_size: number;
  savings_monthly: number;
  savings_annual: number;
  summary_text: string | null;
  created_at: string;
}

export interface AuditLeadRow {
  id: string;
  audit_id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  is_high_savings: boolean;
  created_at: string;
}
