-- =====================================================
-- ADD IMAGES COLUMN TO REPLIES TABLE
-- =====================================================
-- This migration adds image attachment support to replies
-- Date: 2026-01-08

-- Add images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'replies'
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.replies
    ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

    -- Add constraint to validate images is an array
    ALTER TABLE public.replies
    ADD CONSTRAINT reply_images_valid CHECK (jsonb_typeof(images) = 'array');

    RAISE NOTICE 'Added images column to replies table';
  ELSE
    RAISE NOTICE 'Images column already exists in replies table';
  END IF;
END $$;

-- Add edited_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'replies'
    AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE public.replies
    ADD COLUMN edited_at TIMESTAMPTZ;

    RAISE NOTICE 'Added edited_at column to replies table';
  ELSE
    RAISE NOTICE 'edited_at column already exists in replies table';
  END IF;
END $$;

-- Update trigger to set edited_at when content is edited
CREATE OR REPLACE FUNCTION update_reply_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.updated_at = NOW();
    NEW.is_edited = TRUE;
    NEW.edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_reply_edited_at ON public.replies;
CREATE TRIGGER set_reply_edited_at
  BEFORE UPDATE ON public.replies
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_edited_at();

-- Comment
COMMENT ON COLUMN public.replies.images IS 'Array of attached images as JSON [{ id, url, alt, width, height }]';
COMMENT ON COLUMN public.replies.edited_at IS 'Timestamp of last content edit';
