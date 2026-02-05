-- Automations table for AHHA Dashboard
-- Stores automation rules with triggers and actions

CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'schedule',
  action_type TEXT NOT NULL DEFAULT 'email',
  config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  last_run TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
CREATE INDEX IF NOT EXISTS idx_automations_created_by ON automations(created_by);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view automations
CREATE POLICY "Authenticated users can view automations"
  ON automations FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create automations
CREATE POLICY "Authenticated users can insert automations"
  ON automations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update automations
CREATE POLICY "Authenticated users can update automations"
  ON automations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Users can delete automations
CREATE POLICY "Authenticated users can delete automations"
  ON automations FOR DELETE
  USING (auth.role() = 'authenticated');
