-- ================================================
-- Assured Home Health Agency Dashboard
-- Database Schema Migration
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TASKS
-- ================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CONTACTS
-- ================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  relationship_type TEXT,
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- COLLABORATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- COLLABORATION PARTICIPANTS (link contacts)
-- ================================================
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  UNIQUE(collaboration_id, contact_id)
);

-- ================================================
-- COLLABORATION TASKS (link tasks)
-- ================================================
CREATE TABLE IF NOT EXISTS collaboration_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(collaboration_id, task_id)
);

-- ================================================
-- REPORTS
-- ================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- AUTOMATION LOGS
-- ================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  automation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  details TEXT,
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ACTIVITY LOG
-- ================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  details TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship ON contacts(relationship_type);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (team-wide access)
CREATE POLICY "Authenticated users can manage tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage collaborations" ON collaborations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage collab_participants" ON collaboration_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage collab_tasks" ON collaboration_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage reports" ON reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage automation_logs" ON automation_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage activity_log" ON activity_log FOR ALL USING (auth.role() = 'authenticated');
