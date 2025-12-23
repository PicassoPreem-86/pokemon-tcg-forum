'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizeHtml } from '@/lib/sanitize';
import type {
  DirectMessageResult,
  DirectMessage,
  Conversation,
  BlockUserResult,
} from './action-types';

// Type helper for new tables not yet in database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

// ============================================
// Get or Create Conversation
// ============================================
async function getOrCreateConversation(
  userId: string,
  otherUserId: string
): Promise<{ id: string } | null> {
  const supabase = await createClient();

  // Try to find existing conversation
  const { data: existing } = await (supabase as SupabaseAny)
    .from('conversations')
    .select('id')
    .or(
      `and(participant_one.eq.${userId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${userId})`
    )
    .single();

  if (existing) {
    return existing;
  }

  // Create new conversation
  const { data: newConversation, error } = await (supabase as SupabaseAny)
    .from('conversations')
    .insert({
      participant_one: userId,
      participant_two: otherUserId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return newConversation;
}

// ============================================
// Send Direct Message
// ============================================
export async function sendDirectMessage(data: {
  recipientId: string;
  content: string;
}): Promise<DirectMessageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to send messages' };
  }

  const { recipientId, content } = data;

  // Validate content
  if (!content || content.trim().length < 1) {
    return { success: false, error: 'Message cannot be empty' };
  }

  if (content.trim().length > 5000) {
    return { success: false, error: 'Message is too long (max 5000 characters)' };
  }

  // Can't message yourself
  if (recipientId === user.id) {
    return { success: false, error: 'You cannot send messages to yourself' };
  }

  // Check if recipient exists
  const { data: recipient } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', recipientId)
    .single();

  if (!recipient) {
    return { success: false, error: 'Recipient not found' };
  }

  // Check if blocked
  const { data: blocked } = await (supabase as SupabaseAny)
    .from('user_blocks')
    .select('id')
    .eq('blocker_id', recipientId)
    .eq('blocked_id', user.id)
    .single();

  if (blocked) {
    return { success: false, error: 'You cannot send messages to this user' };
  }

  // Get or create conversation
  const conversation = await getOrCreateConversation(user.id, recipientId);
  if (!conversation) {
    return { success: false, error: 'Failed to create conversation' };
  }

  // Sanitize content
  const sanitizedContent = sanitizeHtml(content.trim());

  // Insert message
  const { data: message, error } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: sanitizedContent,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }

  revalidatePath('/messages');
  revalidatePath(`/messages/${recipientId}`);

  return {
    success: true,
    messageId: message.id,
    conversationId: conversation.id,
  };
}

// ============================================
// Get User's Conversations
// ============================================
export async function getConversations(limit: number = 50): Promise<Conversation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all conversations for this user
  const { data: conversations, error } = await (supabase as SupabaseAny)
    .from('conversations')
    .select(
      `
      id,
      participant_one,
      participant_two,
      last_message_at,
      created_at
    `
    )
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error || !conversations) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Enrich with other user info and last message
  const enrichedConversations: Conversation[] = await Promise.all(
    conversations.map(async (conv: SupabaseAny) => {
      const otherUserId =
        conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

      // Get other user's profile
      const { data: otherUser } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      // Get last message
      const { data: lastMessage } = await (supabase as SupabaseAny)
        .from('direct_messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', conv.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await (supabase as SupabaseAny)
        .from('direct_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      return {
        ...conv,
        other_user: otherUser || undefined,
        last_message: lastMessage || undefined,
        unread_count: unreadCount || 0,
      };
    })
  );

  return enrichedConversations;
}

// ============================================
// Get Messages in a Conversation
// ============================================
export async function getMessages(
  otherUserId: string,
  limit: number = 50
): Promise<DirectMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Find the conversation
  const { data: conversation } = await (supabase as SupabaseAny)
    .from('conversations')
    .select('id')
    .or(
      `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
    )
    .single();

  if (!conversation) {
    return [];
  }

  // Get messages
  const { data: messages, error } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      is_read,
      deleted_at,
      created_at,
      sender:profiles!direct_messages_sender_id_fkey(
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq('conversation_id', conversation.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  // Transform to match DirectMessage type
  return (messages || []).map((msg: SupabaseAny) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    is_read: msg.is_read,
    deleted_at: msg.deleted_at,
    created_at: msg.created_at,
    sender: msg.sender as DirectMessage['sender'],
  }));
}

// ============================================
// Mark Messages as Read
// ============================================
export async function markMessagesAsRead(otherUserId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  // Find the conversation
  const { data: conversation } = await (supabase as SupabaseAny)
    .from('conversations')
    .select('id')
    .or(
      `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
    )
    .single();

  if (!conversation) {
    return { success: false };
  }

  // Mark all unread messages from other user as read
  const { error } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversation.id)
    .eq('sender_id', otherUserId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
    return { success: false };
  }

  revalidatePath('/messages');
  revalidatePath(`/messages/${otherUserId}`);

  return { success: true };
}

// ============================================
// Delete a Message (soft delete)
// ============================================
export async function deleteMessage(messageId: string): Promise<DirectMessageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check message exists and user is sender
  const { data: message } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .select('id, sender_id')
    .eq('id', messageId)
    .single();

  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  if (message.sender_id !== user.id) {
    return { success: false, error: 'You can only delete your own messages' };
  }

  // Soft delete
  const { error } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }

  revalidatePath('/messages');

  return { success: true };
}

// ============================================
// Block a User
// ============================================
export async function blockUser(blockedId: string): Promise<BlockUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }

  if (blockedId === user.id) {
    return { success: false, error: 'You cannot block yourself' };
  }

  const { error } = await (supabase as SupabaseAny).from('user_blocks').insert({
    blocker_id: user.id,
    blocked_id: blockedId,
  });

  if (error) {
    if (error.code === '23505') {
      // Unique violation - already blocked
      return { success: true };
    }
    console.error('Error blocking user:', error);
    return { success: false, error: 'Failed to block user' };
  }

  return { success: true };
}

// ============================================
// Unblock a User
// ============================================
export async function unblockUser(blockedId: string): Promise<BlockUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }

  const { error } = await (supabase as SupabaseAny)
    .from('user_blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId);

  if (error) {
    console.error('Error unblocking user:', error);
    return { success: false, error: 'Failed to unblock user' };
  }

  return { success: true };
}

// ============================================
// Get Blocked Users
// ============================================
export async function getBlockedUsers(): Promise<
  { id: string; username: string; avatar_url: string | null; blocked_at: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await (supabase as SupabaseAny)
    .from('user_blocks')
    .select(
      `
      created_at,
      blocked:profiles!user_blocks_blocked_id_fkey(
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching blocked users:', error);
    return [];
  }

  return data.map((block: SupabaseAny) => ({
    id: block.blocked.id,
    username: block.blocked.username,
    avatar_url: block.blocked.avatar_url,
    blocked_at: block.created_at,
  }));
}

// ============================================
// Get Unread Message Count
// ============================================
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  // Get all conversations for this user
  const { data: conversations } = await (supabase as SupabaseAny)
    .from('conversations')
    .select('id')
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);

  if (!conversations || conversations.length === 0) {
    return 0;
  }

  const conversationIds = conversations.map((c: SupabaseAny) => c.id);

  // Count unread messages
  const { count, error } = await (supabase as SupabaseAny)
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .eq('is_read', false)
    .neq('sender_id', user.id);

  if (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }

  return count || 0;
}
