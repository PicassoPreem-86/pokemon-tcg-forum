-- ========================================
-- VERIFY SEED DATA - Quick Check
-- Run this to make sure seed data loaded
-- ========================================

-- Check users
SELECT 'Total Users:' as check_name, COUNT(*) as count FROM profiles;

-- Check threads
SELECT 'Total Threads:' as check_name, COUNT(*) as count FROM threads;

-- Check replies
SELECT 'Total Replies:' as check_name, COUNT(*) as count FROM replies;

-- Check tags
SELECT 'Total Tags:' as check_name, COUNT(*) as count FROM thread_tags;

-- Show threads by category
SELECT
  c.name as category,
  COUNT(t.id) as threads
FROM categories c
LEFT JOIN threads t ON c.id = t.category_id
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;

-- Show user list
SELECT
  username,
  display_name,
  role,
  post_count,
  reputation
FROM profiles
ORDER BY reputation DESC;

-- Show recent threads
SELECT
  t.title,
  c.name as category,
  p.username as author,
  t.view_count,
  t.post_count as replies
FROM threads t
JOIN categories c ON t.category_id = c.id
JOIN profiles p ON t.author_id = p.id
ORDER BY t.created_at DESC
LIMIT 10;
