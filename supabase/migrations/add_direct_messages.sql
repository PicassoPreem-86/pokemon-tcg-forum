-- Direct Messages Migration
-- Adds private messaging functionality between users

-- ============================================
-- Conversations Table (for grouping messages)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique conversation between two users (order-independent)
  CONSTRAINT unique_conversation UNIQUE (
    LEAST(participant_one, participant_two),
    GREATEST(participant_one, participant_two)
  ),
  -- Prevent self-conversations
  CONSTRAINT no_self_conversation CHECK (participant_one != participant_two)
);

-- ============================================
-- Direct Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User Blocks Table (for blocking users from messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_one ON conversations(participant_one);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_two ON conversations(participant_two);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Direct messages indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created ON direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread ON direct_messages(conversation_id, is_read) WHERE is_read = FALSE;

-- User blocks indexes
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = participant_one OR auth.uid() = participant_two
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_one OR auth.uid() = participant_two
  );

CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = participant_one OR auth.uid() = participant_two
  );

-- Direct messages policies
CREATE POLICY "Users can view messages in their conversations" ON direct_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = direct_messages.conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

CREATE POLICY "Recipients can mark messages as read" ON direct_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = direct_messages.conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
    AND sender_id != auth.uid()
  );

CREATE POLICY "Senders can delete their messages" ON direct_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- User blocks policies
CREATE POLICY "Users can view their blocks" ON user_blocks
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks" ON user_blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can remove their blocks" ON user_blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- ============================================
-- Function to update conversation last_message_at
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_message_at on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON direct_messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- Function to create notification on new message
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_username TEXT;
  message_preview TEXT;
BEGIN
  -- Get recipient (the other participant)
  SELECT
    CASE
      WHEN c.participant_one = NEW.sender_id THEN c.participant_two
      ELSE c.participant_one
    END INTO recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Get sender username
  SELECT username INTO sender_username
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create message preview (first 50 chars)
  message_preview := LEFT(NEW.content, 50);
  IF LENGTH(NEW.content) > 50 THEN
    message_preview := message_preview || '...';
  END IF;

  -- Insert notification
  INSERT INTO notifications (user_id, actor_id, type, message, link)
  VALUES (
    recipient_id,
    NEW.sender_id,
    'message',
    sender_username || ' sent you a message: ' || message_preview,
    '/messages/' || NEW.sender_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification on new message
DROP TRIGGER IF EXISTS trigger_notify_new_message ON direct_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- ============================================
-- Add 'message' to notification type check if it exists
-- ============================================
-- Note: If notification type is enforced by check constraint, update it
-- This is handled at the application level for flexibility
