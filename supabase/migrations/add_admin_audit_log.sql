-- ============================================
-- Admin Audit Log Table
-- Persistent audit trail for all admin actions
-- ============================================

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_action ON admin_audit_log(admin_id, action);

-- Add comment for documentation
COMMENT ON TABLE admin_audit_log IS 'Audit trail for all administrative actions (role changes, bulk operations, system settings)';
COMMENT ON COLUMN admin_audit_log.admin_id IS 'The admin who performed the action';
COMMENT ON COLUMN admin_audit_log.action IS 'The type of action performed (e.g., update_user_role, bulk_update_roles)';
COMMENT ON COLUMN admin_audit_log.details IS 'JSON details about the action (target user, old/new values, etc.)';
COMMENT ON COLUMN admin_audit_log.ip_address IS 'IP address of the admin when action was performed';
COMMENT ON COLUMN admin_audit_log.user_agent IS 'Browser/client user agent string';

-- Add deleted_at column to profiles for soft delete support
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for soft-deleted users
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add status field to profiles
DO $$
BEGIN
  -- Create the enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'banned', 'deleted');
  END IF;
END
$$;

-- Add status column with default
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when user was soft-deleted';
COMMENT ON COLUMN profiles.deleted_by IS 'Admin who performed the soft delete';
COMMENT ON COLUMN profiles.status IS 'Current user status (active, inactive, suspended, banned, deleted)';
