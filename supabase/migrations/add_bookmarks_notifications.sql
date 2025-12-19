-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, thread_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'follow', 'badge')),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_thread ON bookmarks(thread_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Bookmarks: Users can only see and manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can only see and manage their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTION: Create notification on reply
-- ============================================
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  actor_username TEXT;
BEGIN
  -- Get thread author and title
  SELECT author_id, title INTO thread_author_id, thread_title
  FROM threads WHERE id = NEW.thread_id;

  -- Get actor username
  SELECT username INTO actor_username
  FROM profiles WHERE id = NEW.author_id;

  -- Don't notify if replying to own thread
  IF thread_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, link)
    VALUES (
      thread_author_id,
      NEW.author_id,
      'reply',
      actor_username || ' replied to your thread "' || LEFT(thread_title, 50) || '"',
      '/thread/' || (SELECT slug FROM threads WHERE id = NEW.thread_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Create notification on thread like
-- ============================================
CREATE OR REPLACE FUNCTION create_thread_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  thread_slug TEXT;
  actor_username TEXT;
BEGIN
  -- Get thread author, title, and slug
  SELECT author_id, title, slug INTO thread_author_id, thread_title, thread_slug
  FROM threads WHERE id = NEW.thread_id;

  -- Get actor username
  SELECT username INTO actor_username
  FROM profiles WHERE id = NEW.user_id;

  -- Don't notify if liking own thread
  IF thread_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, link)
    VALUES (
      thread_author_id,
      NEW.user_id,
      'like',
      actor_username || ' liked your thread "' || LEFT(thread_title, 50) || '"',
      '/thread/' || thread_slug
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS on_reply_create_notification ON replies;
CREATE TRIGGER on_reply_create_notification
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION create_reply_notification();

DROP TRIGGER IF EXISTS on_thread_like_notification ON thread_likes;
CREATE TRIGGER on_thread_like_notification
  AFTER INSERT ON thread_likes
  FOR EACH ROW EXECUTE FUNCTION create_thread_like_notification();
