'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Thread, Reply, Profile } from '@/lib/supabase/database.types';

export interface ReplyResult {
  success: boolean;
  error?: string;
  replyId?: string;
}

interface CreateReplyData {
  threadId: string;
  content: string;
  parentReplyId?: string | null;
}

export async function createReply(data: CreateReplyData): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to reply' };
  }

  const { threadId, content, parentReplyId } = data;

  // Validate inputs
  if (!threadId) {
    return { success: false, error: 'Thread ID is required' };
  }

  if (!content || content.trim().length < 5) {
    return { success: false, error: 'Reply must be at least 5 characters' };
  }

  // Check if thread exists and isn't locked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('id, slug, is_locked')
    .eq('id', threadId)
    .single() as { data: Pick<Thread, 'id' | 'slug' | 'is_locked'> | null };

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  if (thread.is_locked) {
    return { success: false, error: 'This thread is locked' };
  }

  // Create the reply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply, error } = await (supabase as any)
    .from('replies')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: content.trim(),
      parent_reply_id: parentReplyId || null,
    })
    .select()
    .single() as { data: Reply | null; error: Error | null };

  if (error) {
    console.error('Create reply error:', error);
    return { success: false, error: 'Failed to create reply' };
  }

  revalidatePath(`/thread/${thread.slug}`);

  return { success: true, replyId: reply?.id };
}

interface UpdateReplyData {
  replyId: string;
  content: string;
}

export async function updateReply(data: UpdateReplyData): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to edit a reply' };
  }

  const { replyId, content } = data;

  if (!replyId) {
    return { success: false, error: 'Reply ID is required' };
  }

  if (!content || content.trim().length < 5) {
    return { success: false, error: 'Reply must be at least 5 characters' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('author_id, thread_id')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'author_id' | 'thread_id'> | null };

  if (!reply) {
    return { success: false, error: 'Reply not found' };
  }

  if (reply.author_id !== user.id) {
    // Check if moderator/admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'role'> | null };

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return { success: false, error: 'You do not have permission to edit this reply' };
    }
  }

  // Update the reply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('replies')
    .update({
      content: content.trim(),
      is_edited: true,
    })
    .eq('id', replyId);

  if (error) {
    console.error('Update reply error:', error);
    return { success: false, error: 'Failed to update reply' };
  }

  // Get thread slug for revalidation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('slug')
    .eq('id', reply.thread_id)
    .single() as { data: Pick<Thread, 'slug'> | null };

  if (thread?.slug) {
    revalidatePath(`/thread/${thread.slug}`);
  }

  return { success: true, replyId };
}

export async function deleteReply(replyId: string): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to delete a reply' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('author_id, thread_id')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'author_id' | 'thread_id'> | null };

  if (!reply) {
    return { success: false, error: 'Reply not found' };
  }

  const isOwner = reply.author_id === user.id;

  if (!isOwner) {
    // Check if moderator/admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'role'> | null };

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return { success: false, error: 'You do not have permission to delete this reply' };
    }
  }

  // Delete the reply (cascades to child replies, images, likes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('replies')
    .delete()
    .eq('id', replyId);

  if (error) {
    console.error('Delete reply error:', error);
    return { success: false, error: 'Failed to delete reply' };
  }

  // Get thread slug for revalidation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('slug')
    .eq('id', reply.thread_id)
    .single() as { data: Pick<Thread, 'slug'> | null };

  if (thread?.slug) {
    revalidatePath(`/thread/${thread.slug}`);
  }

  return { success: true };
}

export async function toggleReplyLike(replyId: string): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false, likeCount: 0 };
  }

  // Check if already liked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingLike } = await (supabase as any)
    .from('reply_likes')
    .select('id')
    .eq('reply_id', replyId)
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null };

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('reply_likes')
      .delete()
      .eq('id', existingLike.id);
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('reply_likes')
      .insert({ reply_id: replyId, user_id: user.id });
  }

  // Get updated like count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('like_count')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'like_count'> | null };

  return {
    liked: !existingLike,
    likeCount: reply?.like_count || 0,
  };
}
