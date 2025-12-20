-- ================================================
-- Rate Limiting System for Pokemon TCG Forum
-- ================================================
-- This migration adds persistent rate limiting support
-- Optional: The in-memory solution works for serverless,
-- but this provides persistence across restarts

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
CREATE POLICY "Users can view their own rate limits"
  ON rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the system (service role) can insert/update rate limits
-- This prevents users from manipulating their own limits
CREATE POLICY "System can manage rate limits"
  ON rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can view all rate limits for moderation purposes
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
-- This should be run periodically (e.g., via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete rate limit entries older than 2 hours
  -- (Longest window is 1 hour, so 2 hours is safe)
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '2 hours';

  -- Log cleanup (optional)
  RAISE NOTICE 'Cleaned up expired rate limit entries';
END;
$$;

-- Create function to check and increment rate limit (database version)
-- This can be used as an alternative to the in-memory solution
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
  -- Convert window_ms to interval
  v_window_duration := (p_window_ms || ' milliseconds')::INTERVAL;

  -- Try to get existing rate limit record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action
  FOR UPDATE;

  -- If no record or window expired, create/reset
  IF v_record IS NULL OR v_now - v_record.window_start >= v_window_duration THEN
    -- Insert or update with new window
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

  -- Check if limit exceeded
  IF v_record.count >= p_max_requests THEN
    -- Calculate retry after in seconds
    DECLARE
      v_retry_after INTEGER;
    BEGIN
      v_retry_after := CEIL(EXTRACT(EPOCH FROM (v_record.window_start + v_window_duration - v_now)));
      RETURN QUERY SELECT false, v_record.count, v_retry_after;
      RETURN;
    END;
  END IF;

  -- Increment counter
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
  -- Check if caller is admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reset rate limits';
  END IF;

  -- Delete the rate limit record
  DELETE FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action;

  RETURN true;
END;
$$;

-- Add comment to table
COMMENT ON TABLE rate_limits IS 'Persistent storage for rate limiting. Used as alternative to in-memory store for multi-instance deployments.';
COMMENT ON COLUMN rate_limits.action IS 'Action being rate limited (e.g., thread_create, reply_create, like_action, profile_update)';
COMMENT ON COLUMN rate_limits.count IS 'Number of actions performed in current window';
COMMENT ON COLUMN rate_limits.window_start IS 'Start time of the current rate limit window';

-- Grant necessary permissions
GRANT SELECT ON rate_limits TO authenticated;
GRANT ALL ON rate_limits TO service_role;
