-- Create concepts table
CREATE TABLE concepts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  classification TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'voice',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disable RLS (Clerk auth validated server-side)
ALTER TABLE concepts DISABLE ROW LEVEL SECURITY;

-- Index for efficient queries
CREATE INDEX concepts_user_id_created_at_idx ON concepts(user_id, created_at DESC);
