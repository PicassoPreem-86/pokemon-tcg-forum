-- ============================================
-- FIX: Create Admin Profile for Threads
-- ============================================
-- This ensures threads have a valid author profile

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@tcggossip.com'
  LIMIT 1;

  -- If admin user exists, create/update profile
  IF admin_user_id IS NOT NULL THEN
    -- Insert or update admin profile
    INSERT INTO profiles (
      id,
      username,
      display_name,
      avatar_url,
      role,
      bio,
      post_count,
      reputation,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin',
      'TCG Gossip Admin',
      '/images/avatars/admin.png',
      'admin',
      'Official TCG Gossip administrator and community manager',
      28, -- Total posts from seed data
      1000,
      NOW() - INTERVAL '6 months',
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      username = 'admin',
      display_name = 'TCG Gossip Admin',
      role = 'admin',
      post_count = 28,
      reputation = 1000,
      updated_at = NOW();

    RAISE NOTICE 'Admin profile created/updated successfully for user ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'No admin user found with email admin@tcggossip.com';
    RAISE NOTICE 'Please create admin user first or update email in seed data';
  END IF;
END $$;

-- Verify the fix worked
SELECT
  'Profile Check' as check_type,
  p.id,
  p.username,
  p.display_name,
  p.role,
  p.post_count
FROM profiles p
WHERE p.username = 'admin';

-- Verify threads now have valid author joins
SELECT
  'Thread Check' as check_type,
  t.title,
  p.username as author,
  c.name as category
FROM threads t
LEFT JOIN profiles p ON t.author_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.created_at DESC
LIMIT 10;
