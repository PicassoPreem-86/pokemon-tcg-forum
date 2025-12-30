-- ========================================
-- POKEMON TCG FORUM - PRODUCTION DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom type for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('newbie', 'member', 'verified', 'trusted', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'newbie',
  bio TEXT,
  location TEXT,
  signature TEXT,
  post_count INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'MessageSquare',
  color TEXT DEFAULT '#6366F1',
  sort_order INTEGER DEFAULT 0,
  thread_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- THREADS TABLE
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 1,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
  CONSTRAINT content_length CHECK (char_length(content) >= 20)
);

-- THREAD TAGS TABLE
CREATE TABLE IF NOT EXISTS thread_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(thread_id, tag)
);

-- REPLIES TABLE
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT content_length CHECK (char_length(content) >= 5)
);

-- REPLY IMAGES TABLE
CREATE TABLE IF NOT EXISTS reply_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER DEFAULT 0
);

-- USER BADGES TABLE
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIKES TABLES
CREATE TABLE IF NOT EXISTS thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_created ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_updated ON threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_slug ON threads(slug);
CREATE INDEX IF NOT EXISTS idx_replies_thread ON replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_replies_author ON replies(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_replies_created ON replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_tags_thread ON thread_tags(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_tags_tag ON thread_tags(tag);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ========================================
-- CRITICAL: USER CREATION FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_badges (user_id, name, icon, color)
  VALUES (NEW.id, 'New Trainer', 'Sparkles', '#10B981');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CRITICAL: USER CREATION TRIGGER
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- OTHER HELPER FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_view_count(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET view_count = view_count + 1 WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS FOR AUTO-UPDATING
-- ========================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_threads ON threads;
DROP TRIGGER IF EXISTS set_updated_at_replies ON replies;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_threads
  BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_replies
  BEFORE UPDATE ON replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Threads policies
DROP POLICY IF EXISTS "Threads are viewable by everyone" ON threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON threads;
DROP POLICY IF EXISTS "Authors can update own threads" ON threads;
DROP POLICY IF EXISTS "Authors and mods can delete threads" ON threads;

CREATE POLICY "Threads are viewable by everyone" ON threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own threads" ON threads FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors and mods can delete threads" ON threads FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Thread tags policies
DROP POLICY IF EXISTS "Thread tags are viewable by everyone" ON thread_tags;
DROP POLICY IF EXISTS "Thread authors can manage tags" ON thread_tags;
CREATE POLICY "Thread tags are viewable by everyone" ON thread_tags FOR SELECT USING (true);
CREATE POLICY "Thread authors can manage tags" ON thread_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM threads WHERE id = thread_id AND author_id = auth.uid())
);

-- Replies policies
DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON replies;
DROP POLICY IF EXISTS "Authors can update own replies" ON replies;
DROP POLICY IF EXISTS "Authors and mods can delete replies" ON replies;

CREATE POLICY "Replies are viewable by everyone" ON replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own replies" ON replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors and mods can delete replies" ON replies FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Reply images policies
DROP POLICY IF EXISTS "Reply images are viewable by everyone" ON reply_images;
DROP POLICY IF EXISTS "Reply authors can manage images" ON reply_images;
CREATE POLICY "Reply images are viewable by everyone" ON reply_images FOR SELECT USING (true);
CREATE POLICY "Reply authors can manage images" ON reply_images FOR ALL USING (
  EXISTS (SELECT 1 FROM replies WHERE id = reply_id AND author_id = auth.uid())
);

-- Likes policies
DROP POLICY IF EXISTS "Thread likes are viewable by everyone" ON thread_likes;
DROP POLICY IF EXISTS "Users can manage their thread likes" ON thread_likes;
DROP POLICY IF EXISTS "Reply likes are viewable by everyone" ON reply_likes;
DROP POLICY IF EXISTS "Users can manage their reply likes" ON reply_likes;

CREATE POLICY "Thread likes are viewable by everyone" ON thread_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their thread likes" ON thread_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Reply likes are viewable by everyone" ON reply_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their reply likes" ON reply_likes FOR ALL USING (auth.uid() = user_id);

-- Badges policies
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON user_badges;
CREATE POLICY "Badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- ========================================
-- SEED DATA: Categories
-- ========================================
INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'general', 'General Discussion', 'Chat about anything Pokemon TCG related', 'MessageSquare', '#EC4899', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'general');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'collecting', 'Collecting', 'Show off your collection and discuss collecting strategies', 'Star', '#F59E0B', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'collecting');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'market', 'Market & Prices', 'Price checks, market trends, and investment discussion', 'TrendingUp', '#06B6D4', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'market');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'grading', 'Grading', 'PSA, BGS, CGC grading discussion and submissions', 'Award', '#8B5CF6', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'grading');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'articles', 'Articles & Guides', 'Community guides, tutorials, and educational content', 'BookOpen', '#10B981', 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'articles');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'news', 'News', 'Latest Pokemon TCG news and announcements', 'Newspaper', '#3B82F6', 6
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'news');

INSERT INTO categories (slug, name, description, icon, color, sort_order)
SELECT 'trading', 'Buy & Trade', 'Marketplace for buying, selling, and trading cards', 'ArrowLeftRight', '#10B981', 7
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'trading');

-- ========================================
-- DONE! Registration should now work.
-- ========================================
