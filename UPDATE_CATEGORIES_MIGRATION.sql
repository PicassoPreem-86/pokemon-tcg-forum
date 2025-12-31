-- ========================================
-- CATEGORY UPDATE MIGRATION
-- Based on Competitor Analysis (COMPETITOR_ANALYSIS.md)
-- Date: December 30, 2025
-- ========================================
--
-- This migration adds critical missing categories identified
-- in the competitor research, following Pokemon TCG forum best practices.
--
-- Run this in Supabase SQL Editor after RUN_THIS_IN_SUPABASE.sql
-- ========================================

-- ========================================
-- STEP 1: Add New Essential Categories
-- ========================================

-- Competitive Play (CRITICAL - all major competitors have this)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'competitive', 'Competitive Play', 'Deck building, tournament reports, and meta discussion', 'Swords', '#3B82F6', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'competitive');

-- TCG Pocket (HOT TOPIC 2025 - new mobile game driving huge engagement)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'tcg-pocket', 'TCG Pocket', 'Pokemon TCG Pocket mobile game - strategy, decks, and tips', 'Smartphone', '#10B981', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tcg-pocket');

-- Pulls & Showcases (HIGH ENGAGEMENT - most popular content type)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'pulls', 'Pulls & Showcases', 'Show off your amazing pulls, mail day, and collection showcases', 'Sparkles', '#F59E0B', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'pulls');

-- Authentication (IMPORTANT - major concern with counterfeits)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'authentication', 'Authentication', 'Fake card identification, verification, and authentication help', 'ShieldCheck', '#EF4444', 9
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'authentication');

-- Beginner Zone (RECOMMENDED - helps new collectors)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'beginners', 'Beginner Zone', 'New to Pokemon TCG? Start here! Rules, guides, and getting started', 'GraduationCap', '#A855F7', 11
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'beginners');

-- Investment & Finance (RECOMMENDED - hot topic in 2025)
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'investment', 'Investment & Finance', 'Long-term holds, sealed product investing, and market trends', 'TrendingUp', '#06B6D4', 12
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'investment');

-- ========================================
-- STEP 2: Update Existing Category Sort Order
-- ========================================

-- Reorganize existing categories with new optimal order
UPDATE categories SET sort_order = 1 WHERE slug = 'general';          -- General Discussion (stay at top)
UPDATE categories SET sort_order = 5 WHERE slug = 'collecting';       -- Collecting (after new categories)
UPDATE categories SET sort_order = 6 WHERE slug = 'market';           -- Market & Prices
UPDATE categories SET sort_order = 7 WHERE slug = 'grading';          -- Grading
UPDATE categories SET sort_order = 8 WHERE slug = 'articles';         -- Articles & Guides
UPDATE categories SET sort_order = 10 WHERE slug = 'news';            -- News
UPDATE categories SET sort_order = 13 WHERE slug = 'trading';         -- Buy & Trade (near bottom)

-- ========================================
-- STEP 3: Update Category Descriptions for Clarity
-- ========================================

-- Make descriptions more actionable and clear
UPDATE categories
SET description = 'General Pokemon TCG discussion, introductions, and community chat'
WHERE slug = 'general';

UPDATE categories
SET description = 'Share your collection, vintage cards, binder organization, and set completion'
WHERE slug = 'collecting';

UPDATE categories
SET description = 'Price checks, market analysis, card values, and investment discussion'
WHERE slug = 'market';

UPDATE categories
SET description = 'PSA, BGS, CGC grading - submissions, pop reports, and should I grade?'
WHERE slug = 'grading';

UPDATE categories
SET description = 'Community guides, how-tos, tutorials, and educational content'
WHERE slug = 'articles';

UPDATE categories
SET description = 'Latest Pokemon TCG news, set releases, and official announcements'
WHERE slug = 'news';

UPDATE categories
SET description = 'Buy, sell, and trade Pokemon cards - marketplace and deals'
WHERE slug = 'trading';

-- ========================================
-- STEP 4: Verify Category Setup
-- ========================================

-- View all categories in order
SELECT
  slug,
  name,
  description,
  icon,
  color,
  sort_order,
  thread_count,
  post_count
FROM categories
ORDER BY sort_order;

-- ========================================
-- EXPECTED RESULTS (13 Categories):
-- ========================================
-- 1.  General Discussion
-- 2.  Competitive Play (NEW)
-- 3.  TCG Pocket (NEW)
-- 4.  Pulls & Showcases (NEW)
-- 5.  Collecting
-- 6.  Market & Prices
-- 7.  Grading
-- 8.  Articles & Guides
-- 9.  Authentication (NEW)
-- 10. News
-- 11. Beginner Zone (NEW)
-- 12. Investment & Finance (NEW)
-- 13. Buy & Trade

-- ========================================
-- STEP 5: Create Welcome Threads (Optional Seed Data)
-- ========================================

-- Note: These are commented out. Uncomment and customize after you
-- have a real admin user created. Replace 'YOUR_ADMIN_USER_ID' with
-- your actual admin user ID from the profiles table.

/*
-- Get your admin user ID first:
SELECT id, username FROM profiles WHERE role = 'admin';

-- Then use that ID below in place of 'YOUR_ADMIN_USER_ID'

-- Welcome thread for Competitive Play
INSERT INTO threads (slug, title, content, category_id, author_id, is_pinned)
SELECT
  'welcome-to-competitive-play',
  'Welcome to Competitive Play!',
  'Discuss deck building, tournament strategies, and the current meta. Share your tournament reports and deck lists here!',
  (SELECT id FROM categories WHERE slug = 'competitive'),
  'YOUR_ADMIN_USER_ID',
  true
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'welcome-to-competitive-play');

-- Welcome thread for TCG Pocket
INSERT INTO threads (slug, title, content, category_id, author_id, is_pinned)
SELECT
  'welcome-to-tcg-pocket',
  'Welcome to TCG Pocket Discussion!',
  'Pokemon TCG Pocket is here! Discuss mobile strategies, F2P guides, deck building, and compare physical vs digital gameplay.',
  (SELECT id FROM categories WHERE slug = 'tcg-pocket'),
  'YOUR_ADMIN_USER_ID',
  true
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'welcome-to-tcg-pocket');

-- Welcome thread for Pulls & Showcases
INSERT INTO threads (slug, title, content, category_id, author_id, is_pinned)
SELECT
  'welcome-to-pulls-and-showcases',
  'Welcome to Pulls & Showcases!',
  'Show off your amazing pulls, mail day hauls, and collection showcases! Share your chase cards and completed sets.',
  (SELECT id FROM categories WHERE slug = 'pulls'),
  'YOUR_ADMIN_USER_ID',
  true
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'welcome-to-pulls-and-showcases');

-- Welcome thread for Authentication
INSERT INTO threads (slug, title, content, category_id, author_id, is_pinned)
SELECT
  'how-to-spot-fake-pokemon-cards',
  'How to Spot Fake Pokemon Cards - Complete Guide',
  'Learn how to identify fake Pokemon cards and protect your collection. Post here for authentication help and verification requests.',
  (SELECT id FROM categories WHERE slug = 'authentication'),
  'YOUR_ADMIN_USER_ID',
  true
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'how-to-spot-fake-pokemon-cards');

-- Welcome thread for Beginners
INSERT INTO threads (slug, title, content, category_id, author_id, is_pinned)
SELECT
  'welcome-new-trainers',
  'Welcome New Trainers - Start Here!',
  'New to Pokemon TCG collecting or playing? This is your starting point! Ask questions, get advice, and learn the basics.',
  (SELECT id FROM categories WHERE slug = 'beginners'),
  'YOUR_ADMIN_USER_ID',
  true
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'welcome-new-trainers');
*/

-- ========================================
-- MIGRATION COMPLETE!
-- ========================================
-- Your forum now has all essential categories based on
-- competitor analysis of top Pokemon TCG forums.
--
-- Next Steps:
-- 1. ✅ Verify categories in Supabase dashboard
-- 2. ✅ Update frontend to display new categories
-- 3. ✅ Create welcome threads for new categories
-- 4. ✅ Remove mock data and use real database queries
-- ========================================
