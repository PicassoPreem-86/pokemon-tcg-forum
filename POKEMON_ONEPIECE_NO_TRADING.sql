-- ============================================
-- POKEMON + ONE PIECE TCG FORUM (NO TRADING)
-- ============================================
-- Multi-game forum for Pokemon and One Piece TCG
-- WITHOUT buy/sell/trade marketplace features

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
-- STEP 2: Add Game Column (if not exists)
-- ============================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS game TEXT DEFAULT 'pokemon';
CREATE INDEX IF NOT EXISTS idx_categories_game ON categories(game);

-- ============================================
-- STEP 3: Create Pokemon TCG Categories (NO TRADING)
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, game, sort_order) VALUES
('general', 'General Discussion', 'Chat about anything Pokemon TCG related', 'MessageSquare', '#EC4899', 'pokemon', 1),
('collecting', 'Collecting', 'Show off your collection and discuss collecting strategies', 'Star', '#F59E0B', 'pokemon', 2),
('competitive', 'Competitive Play', 'Deck building, strategies, and tournament discussion', 'Trophy', '#8B5CF6', 'pokemon', 3),
('market', 'Market & Prices', 'Price checks, market trends, and investment discussion', 'TrendingUp', '#06B6D4', 'pokemon', 4),
('grading', 'Grading', 'PSA, BGS, CGC grading discussion and submissions', 'Award', '#A855F7', 'pokemon', 5),
('pulls', 'Pulls & Openings', 'Share your pack openings and best pulls', 'Package', '#10B981', 'pokemon', 6),
('news', 'News', 'Latest Pokemon TCG news and announcements', 'Newspaper', '#3B82F6', 'pokemon', 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  game = EXCLUDED.game,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- STEP 4: Create One Piece TCG Categories (NO TRADING)
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, game, sort_order) VALUES
('op-general', 'One Piece - General', 'Chat about anything One Piece TCG related', 'MessageSquare', '#FF6B35', 'onepiece', 100),
('op-deck-building', 'One Piece - Deck Building', 'Deck lists, strategies, and competitive play', 'Layers', '#4ECDC4', 'onepiece', 101),
('op-collecting', 'One Piece - Collecting', 'Show off your One Piece card collection', 'Star', '#FFD93D', 'onepiece', 102),
('op-market', 'One Piece - Market & Prices', 'Price checks and market trends', 'TrendingUp', '#95E1D3', 'onepiece', 103),
('op-pulls', 'One Piece - Pulls & Openings', 'Share your pack openings and best pulls', 'Package', '#F38181', 'onepiece', 104),
('op-news', 'One Piece - News', 'Latest One Piece TCG news and set releases', 'Newspaper', '#AA96DA', 'onepiece', 105)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  game = EXCLUDED.game,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- STEP 5: Verify Changes
-- ============================================

-- Show all categories grouped by game
SELECT
  game,
  COUNT(*) as category_count,
  string_agg(name, ', ' ORDER BY sort_order) as categories
FROM categories
GROUP BY game
ORDER BY game;

-- Show all categories with details
SELECT slug, name, game, color, sort_order
FROM categories
ORDER BY game, sort_order;

-- Show counts
SELECT
  (SELECT COUNT(*) FROM categories WHERE game = 'pokemon') as pokemon_categories,
  (SELECT COUNT(*) FROM categories WHERE game = 'onepiece') as onepiece_categories,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM threads) as total_threads;
