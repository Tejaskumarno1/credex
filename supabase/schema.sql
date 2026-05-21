-- SpendLens Database Schema
-- Run this in Supabase SQL Editor to set up the required tables.

-- Audits table (public, no PII)
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tools_json JSONB NOT NULL,
  use_case TEXT,
  team_size INTEGER,
  savings_monthly NUMERIC,
  savings_annual NUMERIC,
  summary_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table (private, has PII)
CREATE TABLE IF NOT EXISTS audit_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  is_high_savings BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_leads_audit_id ON audit_leads(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_leads_email ON audit_leads(email);
CREATE INDEX IF NOT EXISTS idx_audit_leads_created_at ON audit_leads(created_at DESC);

-- Enable Row Level Security (for future auth features)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to audits (for shareable URLs)
CREATE POLICY "Public read access" ON audits
  FOR SELECT USING (true);

-- Policy: Allow insert via service role only
CREATE POLICY "Service role insert" ON audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role insert leads" ON audit_leads
  FOR INSERT WITH CHECK (true);

-- Policy: Allow service role to read leads (for admin dashboard later)
CREATE POLICY "Service role read leads" ON audit_leads
  FOR SELECT USING (true);
