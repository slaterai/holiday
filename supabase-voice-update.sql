-- Add columns to voice_messages for AI processing results
ALTER TABLE voice_messages ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE voice_messages ADD COLUMN IF NOT EXISTS ai_interpretation TEXT;
ALTER TABLE voice_messages ADD COLUMN IF NOT EXISTS routed_to TEXT;
ALTER TABLE voice_messages ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
