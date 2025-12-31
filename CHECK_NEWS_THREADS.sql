-- Check if news threads exist and are properly configured

-- Check news category
SELECT
  id,
  slug,
  name,
  description
FROM categories
WHERE slug = 'news';

-- Check threads in news category
SELECT
  t.id,
  t.slug,
  t.title,
  t.is_pinned,
  t.is_hot,
  t.view_count,
  t.post_count,
  c.name as category_name,
  p.username as author_username
FROM threads t
JOIN categories c ON t.category_id = c.id
LEFT JOIN profiles p ON t.author_id = p.id
WHERE c.slug = 'news'
ORDER BY t.created_at DESC;

-- Check if there are any threads without valid authors
SELECT
  t.id,
  t.title,
  t.author_id,
  p.username
FROM threads t
LEFT JOIN profiles p ON t.author_id = p.id
WHERE t.category_id = (SELECT id FROM categories WHERE slug = 'news')
  AND p.id IS NULL;
