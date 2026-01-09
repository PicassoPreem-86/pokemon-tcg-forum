-- =====================================================
-- CREATE REPLIES TABLE
-- =====================================================
-- This migration creates the replies table for thread responses
-- Supports nested replies (reply-to-reply), images, and editing
-- Date: 2026-01-08

-- Create replies table
CREATE TABLE IF NOT EXISTS public.replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT reply_content_length CHECK (char_length(content) >= 5),
  CONSTRAINT reply_images_valid CHECK (jsonb_typeof(images) = 'array')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON public.replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_replies_author_id ON public.replies(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent_reply_id ON public.replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON public.replies(created_at DESC);

-- Create index for nested reply lookups
CREATE INDEX IF NOT EXISTS idx_replies_thread_parent ON public.replies(thread_id, parent_reply_id)
  WHERE parent_reply_id IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-deleted replies
CREATE POLICY "Anyone can view replies"
  ON public.replies
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies"
  ON public.replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
  );

-- Policy: Users can update their own replies
CREATE POLICY "Users can update own replies"
  ON public.replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can delete their own replies (or admins/mods)
CREATE POLICY "Users can delete own replies"
  ON public.replies
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp on reply edit
CREATE OR REPLACE FUNCTION update_reply_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  NEW.edited_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reply_timestamp
  BEFORE UPDATE ON public.replies
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION update_reply_updated_at();

-- =====================================================
-- UPDATE THREADS POST_COUNT ON REPLY INSERT/DELETE
-- =====================================================

-- Function: Increment thread post_count when reply is added
CREATE OR REPLACE FUNCTION increment_thread_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.threads
  SET
    post_count = post_count + 1,
    updated_at = NOW()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_post_count_on_reply
  AFTER INSERT ON public.replies
  FOR EACH ROW
  EXECUTE FUNCTION increment_thread_post_count();

-- Function: Decrement thread post_count when reply is deleted
CREATE OR REPLACE FUNCTION decrement_thread_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.threads
  SET post_count = GREATEST(1, post_count - 1)
  WHERE id = OLD.thread_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_post_count_on_reply_delete
  AFTER DELETE ON public.replies
  FOR EACH ROW
  EXECUTE FUNCTION decrement_thread_post_count();

-- =====================================================
-- UPDATE PROFILES POST_COUNT ON REPLY INSERT/DELETE
-- =====================================================

-- Function: Increment user post_count when reply is added
CREATE OR REPLACE FUNCTION increment_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET post_count = post_count + 1
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_user_post_count_on_reply
  AFTER INSERT ON public.replies
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_post_count();

-- Function: Decrement user post_count when reply is deleted
CREATE OR REPLACE FUNCTION decrement_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET post_count = GREATEST(0, post_count - 1)
  WHERE id = OLD.author_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_user_post_count_on_reply_delete
  AFTER DELETE ON public.replies
  FOR EACH ROW
  EXECUTE FUNCTION decrement_user_post_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get reply count for a thread
CREATE OR REPLACE FUNCTION get_reply_count(p_thread_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.replies
  WHERE thread_id = p_thread_id;
$$ LANGUAGE SQL STABLE;

-- Function: Get nested replies for a parent reply
CREATE OR REPLACE FUNCTION get_nested_replies(p_parent_reply_id UUID)
RETURNS SETOF public.replies AS $$
  SELECT *
  FROM public.replies
  WHERE parent_reply_id = p_parent_reply_id
  ORDER BY created_at ASC;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.replies IS 'Stores user replies to threads, supports nested replies';
COMMENT ON COLUMN public.replies.thread_id IS 'Thread this reply belongs to';
COMMENT ON COLUMN public.replies.author_id IS 'User who created the reply';
COMMENT ON COLUMN public.replies.parent_reply_id IS 'Parent reply ID for nested replies (NULL for top-level)';
COMMENT ON COLUMN public.replies.content IS 'Reply content (markdown/HTML)';
COMMENT ON COLUMN public.replies.images IS 'Array of attached images as JSON';
COMMENT ON COLUMN public.replies.is_edited IS 'Whether reply has been edited';
COMMENT ON COLUMN public.replies.edited_at IS 'Timestamp of last edit';
