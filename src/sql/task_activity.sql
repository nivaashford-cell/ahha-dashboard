-- Task Activity / Thinking Notes table
-- Stores real-time progress updates as Niva works on tasks

CREATE TABLE IF NOT EXISTS task_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'thinking',  -- thinking, progress, milestone, complete, error
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by task
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created_at ON task_activity(task_id, created_at DESC);

-- Enable RLS
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view task activity
CREATE POLICY "Authenticated users can view task activity"
  ON task_activity FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can insert activity (Niva writes these)
CREATE POLICY "Anyone can insert task activity"
  ON task_activity FOR INSERT
  WITH CHECK (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE task_activity;
