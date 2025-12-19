import { createClient } from '@/lib/supabase/server';
import type { ReplyWithAuthor } from '@/lib/supabase/database.types';

export async function getRepliesByThread(threadId: string, userId?: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('replies')
    .select(`
      *,
      author:profiles(*),
      images:reply_images(*)
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true }) as { data: ReplyWithAuthor[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching replies:', error);
    return [];
  }

  // If user is logged in, check which replies they've liked
  let likedReplyIds: string[] = [];
  if (userId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: likes } = await (supabase as any)
      .from('reply_likes')
      .select('reply_id')
      .eq('user_id', userId) as { data: { reply_id: string }[] | null };

    likedReplyIds = likes?.map((l) => l.reply_id) || [];
  }

  return (data || []).map((reply) => ({
    ...reply,
    liked_by_user: likedReplyIds.includes(reply.id),
  })) as ReplyWithAuthor[];
}

export async function getReplyById(replyId: string, userId?: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('replies')
    .select(`
      *,
      author:profiles(*),
      images:reply_images(*)
    `)
    .eq('id', replyId)
    .single() as { data: ReplyWithAuthor | null; error: Error | null };

  if (error) {
    console.error('Error fetching reply:', error);
    return null;
  }

  // Check if user has liked this reply
  let likedByUser = false;
  if (userId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: like } = await (supabase as any)
      .from('reply_likes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .single() as { data: { id: string } | null };

    likedByUser = !!like;
  }

  return {
    ...data,
    liked_by_user: likedByUser,
  } as ReplyWithAuthor;
}

export async function getReplyCount(threadId: string): Promise<number> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('replies')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId) as { count: number | null; error: Error | null };

  if (error) {
    console.error('Error getting reply count:', error);
    return 0;
  }

  return count || 0;
}

// Get nested/threaded replies
export async function getNestedReplies(threadId: string, userId?: string) {
  const replies = await getRepliesByThread(threadId, userId);

  // Build tree structure
  const rootReplies: (ReplyWithAuthor & { children: ReplyWithAuthor[] })[] = [];
  const replyMap = new Map<string, ReplyWithAuthor & { children: ReplyWithAuthor[] }>();

  // First pass: create map with children arrays
  replies.forEach((reply) => {
    replyMap.set(reply.id, { ...reply, children: [] });
  });

  // Second pass: build tree
  replies.forEach((reply) => {
    const replyWithChildren = replyMap.get(reply.id)!;
    if (reply.parent_reply_id) {
      const parent = replyMap.get(reply.parent_reply_id);
      if (parent) {
        parent.children.push(replyWithChildren);
      } else {
        // Parent was deleted, treat as root
        rootReplies.push(replyWithChildren);
      }
    } else {
      rootReplies.push(replyWithChildren);
    }
  });

  return rootReplies;
}
