-- Pokemon TCG Forum Database Schema (Safe Version - handles existing objects)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (skip if exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('newbie', 'member', 'vip', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
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

-- ============================================
-- CATEGORIES TABLE
-- ============================================
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

-- ============================================
-- THREADS TABLE
-- ============================================
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

-- ============================================
-- THREAD TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS thread_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,

  UNIQUE(thread_id, tag)
);

-- ============================================
-- REPLIES TABLE
-- ============================================
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

-- ============================================
-- REPLY IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reply_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- LIKES TABLES
-- ============================================
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

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
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

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET view_count = view_count + 1 WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post counts when reply is added
CREATE OR REPLACE FUNCTION increment_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update thread post count
  UPDATE threads SET post_count = post_count + 1 WHERE id = NEW.thread_id;

  -- Update category post count
  UPDATE categories SET post_count = post_count + 1
  WHERE id = (SELECT category_id FROM threads WHERE id = NEW.thread_id);

  -- Update author's post count
  UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post counts when reply is deleted
CREATE OR REPLACE FUNCTION decrement_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update thread post count
  UPDATE threads SET post_count = post_count - 1 WHERE id = OLD.thread_id;

  -- Update category post count
  UPDATE categories SET post_count = post_count - 1
  WHERE id = (SELECT category_id FROM threads WHERE id = OLD.thread_id);

  -- Update author's post count
  UPDATE profiles SET post_count = post_count - 1 WHERE id = OLD.author_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment thread count when thread is created
CREATE OR REPLACE FUNCTION increment_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement thread count when thread is deleted
CREATE OR REPLACE FUNCTION decrement_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories SET thread_count = thread_count - 1 WHERE id = OLD.category_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update reply like count
CREATE OR REPLACE FUNCTION update_reply_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE replies SET like_count = like_count + 1 WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE replies SET like_count = like_count - 1 WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle new user signup - create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Add "New Trainer" badge
  INSERT INTO user_badges (user_id, name, icon, color)
  VALUES (NEW.id, 'New Trainer', 'Sparkles', '#10B981');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS (Drop and recreate)
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_threads ON threads;
CREATE TRIGGER set_updated_at_threads
  BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_replies ON replies;
CREATE TRIGGER set_updated_at_replies
  BEFORE UPDATE ON replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_reply_insert ON replies;
CREATE TRIGGER on_reply_insert
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION increment_post_counts();

DROP TRIGGER IF EXISTS on_reply_delete ON replies;
CREATE TRIGGER on_reply_delete
  AFTER DELETE ON replies
  FOR EACH ROW EXECUTE FUNCTION decrement_post_counts();

DROP TRIGGER IF EXISTS on_thread_insert ON threads;
CREATE TRIGGER on_thread_insert
  AFTER INSERT ON threads
  FOR EACH ROW EXECUTE FUNCTION increment_thread_count();

DROP TRIGGER IF EXISTS on_thread_delete ON threads;
CREATE TRIGGER on_thread_delete
  AFTER DELETE ON threads
  FOR EACH ROW EXECUTE FUNCTION decrement_thread_count();

DROP TRIGGER IF EXISTS on_reply_like_change ON reply_likes;
CREATE TRIGGER on_reply_like_change
  AFTER INSERT OR DELETE ON reply_likes
  FOR EACH ROW EXECUTE FUNCTION update_reply_like_count();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Threads are viewable by everyone" ON threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON threads;
DROP POLICY IF EXISTS "Authors can update own threads" ON threads;
DROP POLICY IF EXISTS "Authors and mods can delete threads" ON threads;
DROP POLICY IF EXISTS "Thread tags are viewable by everyone" ON thread_tags;
DROP POLICY IF EXISTS "Thread authors can manage tags" ON thread_tags;
DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON replies;
DROP POLICY IF EXISTS "Authors can update own replies" ON replies;
DROP POLICY IF EXISTS "Authors and mods can delete replies" ON replies;
DROP POLICY IF EXISTS "Reply images are viewable by everyone" ON reply_images;
DROP POLICY IF EXISTS "Reply authors can manage images" ON reply_images;
DROP POLICY IF EXISTS "Thread likes are viewable by everyone" ON thread_likes;
DROP POLICY IF EXISTS "Users can manage their thread likes" ON thread_likes;
DROP POLICY IF EXISTS "Reply likes are viewable by everyone" ON reply_likes;
DROP POLICY IF EXISTS "Users can manage their reply likes" ON reply_likes;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON user_badges;

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: Anyone can read
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Threads: Anyone can read, authenticated users can create, authors can update/delete
CREATE POLICY "Threads are viewable by everyone" ON threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads" ON threads
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete threads" ON threads
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Thread tags: Anyone can read, thread authors can manage
CREATE POLICY "Thread tags are viewable by everyone" ON thread_tags
  FOR SELECT USING (true);

CREATE POLICY "Thread authors can manage tags" ON thread_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM threads WHERE id = thread_id AND author_id = auth.uid())
  );

-- Replies: Anyone can read, authenticated users can create, authors can update/delete
CREATE POLICY "Replies are viewable by everyone" ON replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies" ON replies
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete replies" ON replies
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Reply images: Same as replies
CREATE POLICY "Reply images are viewable by everyone" ON reply_images
  FOR SELECT USING (true);

CREATE POLICY "Reply authors can manage images" ON reply_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM replies WHERE id = reply_id AND author_id = auth.uid())
  );

-- Likes: Anyone can read, users manage their own
CREATE POLICY "Thread likes are viewable by everyone" ON thread_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their thread likes" ON thread_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Reply likes are viewable by everyone" ON reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their reply likes" ON reply_likes
  FOR ALL USING (auth.uid() = user_id);

-- Badges: Anyone can read
CREATE POLICY "Badges are viewable by everyone" ON user_badges
  FOR SELECT USING (true);

-- ============================================
-- SEED DATA: Default Categories (skip if exists)
-- ============================================
INSERT INTO categories (slug, name, description, icon, color, sort_order) VALUES
  ('general', 'General Discussion', 'Chat about anything Pokemon TCG related', 'MessageSquare', '#EC4899', 1),
  ('collecting', 'Collecting', 'Show off your collection and discuss collecting strategies', 'Star', '#F59E0B', 2),
  ('market', 'Market & Prices', 'Price checks, market trends, and investment discussion', 'TrendingUp', '#06B6D4', 3),
  ('grading', 'Grading', 'PSA, BGS, CGC grading discussion and submissions', 'Award', '#8B5CF6', 4),
  ('articles', 'Articles & Guides', 'Community guides, tutorials, and educational content', 'BookOpen', '#10B981', 5),
  ('news', 'News', 'Latest Pokemon TCG news and announcements', 'Newspaper', '#3B82F6', 6),
  ('trading', 'Buy & Trade', 'Marketplace for buying, selling, and trading cards', 'ArrowLeftRight', '#10B981', 7)
ON CONFLICT (slug) DO NOTHING;
