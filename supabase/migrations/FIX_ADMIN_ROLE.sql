-- Check all profiles and their roles
SELECT id, username, display_name, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Find the first user (likely you) and set them as admin
-- Uncomment and run this after checking the above:

-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);

-- Or set a specific user as admin by email (get their ID first from auth.users):
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Verify the update
-- SELECT id, username, role FROM profiles WHERE role = 'admin';
