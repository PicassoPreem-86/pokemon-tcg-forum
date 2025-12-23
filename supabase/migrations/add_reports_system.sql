-- ============================================
-- User Reports System
-- Allows users to report content and other users
-- ============================================

-- Create report reason enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
    CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'offensive', 'scam', 'illegal', 'other');
  END IF;
END
$$;

-- Create report status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
  END IF;
END
$$;

-- Create report priority enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_priority') THEN
    CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high');
  END IF;
END
$$;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who submitted the report
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- What is being reported
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'thread', 'reply')),
  target_id UUID NOT NULL,

  -- Report details
  reason VARCHAR(20) NOT NULL DEFAULT 'other',
  details TEXT,

  -- Status and priority
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',

  -- Moderation response
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_type_id ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_moderator_id ON reports(moderator_id);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON reports(status, priority DESC, created_at DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS reports_updated_at_trigger ON reports;
CREATE TRIGGER reports_updated_at_trigger
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- Create function to calculate report priority based on reason
CREATE OR REPLACE FUNCTION calculate_report_priority(report_reason VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  CASE report_reason
    WHEN 'scam' THEN RETURN 'high';
    WHEN 'illegal' THEN RETURN 'high';
    WHEN 'harassment' THEN RETURN 'medium';
    WHEN 'spam' THEN RETURN 'medium';
    WHEN 'offensive' THEN RETURN 'low';
    ELSE RETURN 'medium';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get pending report count (for dashboard)
CREATE OR REPLACE FUNCTION get_pending_reports_count()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM reports WHERE status = 'pending';
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment documentation
COMMENT ON TABLE reports IS 'User-submitted reports for content moderation';
COMMENT ON COLUMN reports.reporter_id IS 'The user who submitted the report';
COMMENT ON COLUMN reports.target_type IS 'Type of content being reported (user, thread, reply)';
COMMENT ON COLUMN reports.target_id IS 'UUID of the reported content';
COMMENT ON COLUMN reports.reason IS 'Category of the report (spam, harassment, offensive, scam, illegal, other)';
COMMENT ON COLUMN reports.details IS 'Additional details provided by the reporter';
COMMENT ON COLUMN reports.status IS 'Current status of the report (pending, reviewing, resolved, dismissed)';
COMMENT ON COLUMN reports.priority IS 'Priority level (low, medium, high) - auto-calculated based on reason';
COMMENT ON COLUMN reports.moderator_id IS 'The moderator/admin who handled the report';
COMMENT ON COLUMN reports.resolution_notes IS 'Notes from the moderator about how the report was resolved';
COMMENT ON COLUMN reports.resolved_at IS 'Timestamp when the report was resolved or dismissed';

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own submitted reports
CREATE POLICY reports_select_own ON reports
  FOR SELECT
  USING (reporter_id = auth.uid());

-- Policy: Users can create reports (but not for themselves)
CREATE POLICY reports_insert ON reports
  FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid()
    AND (target_type != 'user' OR target_id != auth.uid())
  );

-- Policy: Admins and moderators can view all reports
CREATE POLICY reports_select_admin ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Policy: Admins and moderators can update reports
CREATE POLICY reports_update_admin ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );
