-- Create voice_messages table
CREATE TABLE voice_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own messages
CREATE POLICY "Users can view their own voice messages" ON voice_messages
  FOR SELECT USING (auth.uid()::text = user_id);

-- RLS Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own voice messages" ON voice_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create index on user_id and created_at for efficient queries
CREATE INDEX voice_messages_user_id_created_at_idx ON voice_messages(user_id, created_at DESC);
