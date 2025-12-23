-- Add banned_by and suspended_by columns to track who issued bans/suspensions
-- This provides direct reference in the profile without needing to query moderation_logs

-- Add banned_by column (references the moderator who banned the user)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add suspended_by column (references the moderator who suspended the user)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_banned_by ON profiles(banned_by) WHERE banned_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_suspended_by ON profiles(suspended_by) WHERE suspended_by IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.banned_by IS 'UUID of the moderator/admin who issued the ban';
COMMENT ON COLUMN profiles.suspended_by IS 'UUID of the moderator/admin who issued the suspension';
