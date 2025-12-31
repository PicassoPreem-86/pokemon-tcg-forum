-- ============================================
-- VERIFY THREADS AND PROFILES
-- ============================================

-- Check if admin user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@tcggossip.com' LIMIT 1;

-- Check if admin profile exists
SELECT id, username, display_name FROM profiles WHERE username = 'admin' LIMIT 1;

-- Check all threads with their authors
SELECT
  t.id,
  t.title,
  t.slug,
  c.name as category,
  t.post_count,
  t.view_count,
  t.is_pinned,
  t.is_hot,
  p.username as author_username,
  p.display_name as author_display_name,
  t.created_at
FROM threads t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN profiles p ON t.author_id = p.id
ORDER BY t.created_at DESC;

-- Check reply counts
SELECT
  t.title,
  COUNT(r.id) as actual_reply_count,
  t.post_count as stored_post_count
FROM threads t
LEFT JOIN replies r ON r.thread_id = t.id
GROUP BY t.id, t.title, t.post_count
ORDER BY t.created_at DESC;

-- Check if threads will be fetched by getLatestThreads query
SELECT
  t.id,
  t.title,
  t.slug,
  json_build_object(
    'id', p.id,
    'username', p.username,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url
  ) as author,
  json_build_object(
    'id', c.id,
    'slug', c.slug,
    'name', c.name,
    'color', c.color
  ) as category,
  t.view_count,
  t.post_count,
  t.is_pinned,
  t.is_hot,
  t.updated_at
FROM threads t
LEFT JOIN profiles p ON t.author_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.updated_at DESC
LIMIT 15;
