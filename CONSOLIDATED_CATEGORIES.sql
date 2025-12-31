-- ============================================
-- CONSOLIDATED CATEGORY STRUCTURE
-- ============================================
-- 9 total categories: 5 universal + 2 Pokemon + 2 One Piece
-- Removes redundancy while keeping game-specific where needed

-- ============================================
-- STEP 1: Clean Up Old Data
-- ============================================

-- Delete all existing threads (we'll add new ones)
DELETE FROM thread_tags;
DELETE FROM replies;
DELETE FROM threads;

-- Delete all existing categories
DELETE FROM categories;

-- ============================================
-- STEP 2: Add/Update Game Column
-- ============================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS game TEXT DEFAULT 'all';
CREATE INDEX IF NOT EXISTS idx_categories_game ON categories(game);

-- ============================================
-- STEP 3: Create Universal Categories (5)
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, game, sort_order) VALUES
('collecting', 'Collecting & Showcases', 'Show off your collection from any TCG - Pokemon, One Piece, and more', 'Star', '#F59E0B', 'all', 1),
('market', 'Market & Prices', 'Price checks, market trends, and investment discussion across all TCGs', 'TrendingUp', '#06B6D4', 'all', 2),
('grading', 'Grading & Authentication', 'PSA, BGS, CGC grading help and card authentication for all games', 'Award', '#8B5CF6', 'all', 3),
('pulls', 'Pulls & Pack Openings', 'Share your best pulls and pack opening experiences from any TCG', 'Package', '#10B981', 'all', 4),
('news', 'TCG News & Updates', 'Latest news, set releases, and announcements from all trading card games', 'Newspaper', '#3B82F6', 'all', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  game = EXCLUDED.game,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- STEP 4: Create Pokemon-Specific Categories (2)
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, game, sort_order) VALUES
('pokemon-general', 'Pokemon - General Discussion', 'Chat about anything Pokemon TCG related', 'MessageSquare', '#EC4899', 'pokemon', 10),
('pokemon-competitive', 'Pokemon - Competitive Play', 'Deck building, strategies, meta discussion, and tournament prep', 'Trophy', '#FFCB05', 'pokemon', 11)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  game = EXCLUDED.game,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- STEP 5: Create One Piece-Specific Categories (2)
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, game, sort_order) VALUES
('op-general', 'One Piece - General Discussion', 'Chat about anything One Piece TCG related', 'MessageSquare', '#FF6B35', 'onepiece', 20),
('op-deck-building', 'One Piece - Deck Building', 'Deck lists, leader strategies, and competitive One Piece play', 'Layers', '#4ECDC4', 'onepiece', 21)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  game = EXCLUDED.game,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- STEP 6: Verify Changes
-- ============================================

-- Show all categories grouped by game
SELECT
  CASE
    WHEN game = 'all' THEN '1-Universal'
    WHEN game = 'pokemon' THEN '2-Pokemon'
    WHEN game = 'onepiece' THEN '3-One Piece'
    ELSE game
  END as game_group,
  COUNT(*) as category_count,
  string_agg(name, ', ' ORDER BY sort_order) as categories
FROM categories
GROUP BY game
ORDER BY game_group;

-- Show all categories with details
SELECT slug, name, game, color, sort_order
FROM categories
ORDER BY
  CASE
    WHEN game = 'all' THEN 1
    WHEN game = 'pokemon' THEN 2
    WHEN game = 'onepiece' THEN 3
    ELSE 4
  END,
  sort_order;

-- Show counts
SELECT
  (SELECT COUNT(*) FROM categories WHERE game = 'all') as universal_categories,
  (SELECT COUNT(*) FROM categories WHERE game = 'pokemon') as pokemon_categories,
  (SELECT COUNT(*) FROM categories WHERE game = 'onepiece') as onepiece_categories,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM threads) as total_threads;
