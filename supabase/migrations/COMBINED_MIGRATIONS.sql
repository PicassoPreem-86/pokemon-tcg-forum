-- ================================================
-- COMBINED MIGRATIONS FOR POKEMON TCG FORUM
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ================================================

-- ============================================
-- MIGRATION 1: BOOKMARKS & NOTIFICATIONS
-- ============================================

-- BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, thread_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'follow', 'badge')),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_thread ON bookmarks(thread_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Bookmarks: Users can only see and manage their own bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;
CREATE POLICY "Users can create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can only see and manage their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications for any user
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- FUNCTION: Create notification on reply
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  actor_username TEXT;
BEGIN
  -- Get thread author and title
  SELECT author_id, title INTO thread_author_id, thread_title
  FROM threads WHERE id = NEW.thread_id;

  -- Get actor username
  SELECT username INTO actor_username
  FROM profiles WHERE id = NEW.author_id;

  -- Don't notify if replying to own thread
  IF thread_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, link)
    VALUES (
      thread_author_id,
      NEW.author_id,
      'reply',
      actor_username || ' replied to your thread "' || LEFT(thread_title, 50) || '"',
      '/thread/' || (SELECT slug FROM threads WHERE id = NEW.thread_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION: Create notification on thread like
CREATE OR REPLACE FUNCTION create_thread_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  thread_slug TEXT;
  actor_username TEXT;
BEGIN
  -- Get thread author, title, and slug
  SELECT author_id, title, slug INTO thread_author_id, thread_title, thread_slug
  FROM threads WHERE id = NEW.thread_id;

  -- Get actor username
  SELECT username INTO actor_username
  FROM profiles WHERE id = NEW.user_id;

  -- Don't notify if liking own thread
  IF thread_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, link)
    VALUES (
      thread_author_id,
      NEW.user_id,
      'like',
      actor_username || ' liked your thread "' || LEFT(thread_title, 50) || '"',
      '/thread/' || thread_slug
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS
DROP TRIGGER IF EXISTS on_reply_create_notification ON replies;
CREATE TRIGGER on_reply_create_notification
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION create_reply_notification();

DROP TRIGGER IF EXISTS on_thread_like_notification ON thread_likes;
CREATE TRIGGER on_thread_like_notification
  AFTER INSERT ON thread_likes
  FOR EACH ROW EXECUTE FUNCTION create_thread_like_notification();

-- ============================================
-- MIGRATION 2: MODERATION SYSTEM
-- ============================================

-- Add moderation fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;

-- Create index for banned users query
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);

-- Create moderation log table for audit trail
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for moderation log queries
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_id ON moderation_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_type ON moderation_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- Add deleted_by field to threads and replies for soft deletes
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

ALTER TABLE replies
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND is_banned = TRUE
    AND (banned_until IS NULL OR banned_until > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND is_suspended = TRUE
    AND (suspended_until IS NULL OR suspended_until > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-expire suspensions and temp bans
CREATE OR REPLACE FUNCTION expire_temporary_bans()
RETURNS void AS $$
BEGIN
  -- Expire temporary bans
  UPDATE profiles
  SET is_banned = FALSE,
      banned_until = NULL
  WHERE is_banned = TRUE
    AND banned_until IS NOT NULL
    AND banned_until <= NOW();

  -- Expire suspensions
  UPDATE profiles
  SET is_suspended = FALSE,
      suspended_until = NULL
  WHERE is_suspended = TRUE
    AND suspended_until IS NOT NULL
    AND suspended_until <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for moderation_logs
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view moderation logs
DROP POLICY IF EXISTS "Admins can view moderation logs" ON moderation_logs;
CREATE POLICY "Admins can view moderation logs" ON moderation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only admins/moderators can insert moderation logs
DROP POLICY IF EXISTS "Admins can insert moderation logs" ON moderation_logs;
CREATE POLICY "Admins can insert moderation logs" ON moderation_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

COMMENT ON TABLE moderation_logs IS 'Audit trail for all moderation actions';
COMMENT ON FUNCTION is_user_banned IS 'Check if a user is currently banned';
COMMENT ON FUNCTION is_user_suspended IS 'Check if a user is currently suspended';
COMMENT ON FUNCTION expire_temporary_bans IS 'Auto-expire temporary bans and suspensions';

-- ============================================
-- MIGRATION 3: RATE LIMITING
-- ============================================

-- Create rate_limits table for persistent rate limit tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_action UNIQUE(user_id, action)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Add RLS policies for rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own rate limit status
DROP POLICY IF EXISTS "Users can view their own rate limits" ON rate_limits;
CREATE POLICY "Users can view their own rate limits"
  ON rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the system (service role) can insert/update rate limits
DROP POLICY IF EXISTS "System can manage rate limits" ON rate_limits;
CREATE POLICY "System can manage rate limits"
  ON rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can view all rate limits for moderation purposes
DROP POLICY IF EXISTS "Admins can view all rate limits" ON rate_limits;
CREATE POLICY "Admins can view all rate limits"
  ON rate_limits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to clean up expired rate limit entries
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '2 hours';
  RAISE NOTICE 'Cleaned up expired rate limit entries';
END;
$$;

-- Create function to check and increment rate limit (database version)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action VARCHAR,
  p_max_requests INTEGER,
  p_window_ms INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_window_start TIMESTAMPTZ;
  v_window_duration INTERVAL;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  v_window_duration := (p_window_ms || ' milliseconds')::INTERVAL;

  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action
  FOR UPDATE;

  IF v_record IS NULL OR v_now - v_record.window_start >= v_window_duration THEN
    INSERT INTO rate_limits (user_id, action, count, window_start)
    VALUES (p_user_id, p_action, 1, v_now)
    ON CONFLICT (user_id, action)
    DO UPDATE SET
      count = 1,
      window_start = v_now,
      updated_at = v_now;

    RETURN QUERY SELECT true, 1, 0;
    RETURN;
  END IF;

  IF v_record.count >= p_max_requests THEN
    DECLARE
      v_retry_after INTEGER;
    BEGIN
      v_retry_after := CEIL(EXTRACT(EPOCH FROM (v_record.window_start + v_window_duration - v_now)));
      RETURN QUERY SELECT false, v_record.count, v_retry_after;
      RETURN;
    END;
  END IF;

  UPDATE rate_limits
  SET count = count + 1,
      updated_at = v_now
  WHERE user_id = p_user_id AND action = p_action;

  RETURN QUERY SELECT true, v_record.count + 1, 0;
END;
$$;

-- Create function to reset rate limit (admin only)
CREATE OR REPLACE FUNCTION admin_reset_rate_limit(
  p_user_id UUID,
  p_action VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role VARCHAR;
BEGIN
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reset rate limits';
  END IF;

  DELETE FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action;

  RETURN true;
END;
$$;

COMMENT ON TABLE rate_limits IS 'Persistent storage for rate limiting.';
COMMENT ON COLUMN rate_limits.action IS 'Action being rate limited (e.g., thread_create, reply_create)';
COMMENT ON COLUMN rate_limits.count IS 'Number of actions performed in current window';
COMMENT ON COLUMN rate_limits.window_start IS 'Start time of the current rate limit window';

-- Grant necessary permissions
GRANT SELECT ON rate_limits TO authenticated;
GRANT ALL ON rate_limits TO service_role;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
SELECT 'All migrations completed successfully!' as status;
