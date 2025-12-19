import { createClient } from '@/lib/supabase/server';
import type { Profile, UserBadge } from '@/lib/supabase/database.types';

export type ProfileWithBadges = Profile & {
  badges: UserBadge[];
};

export async function getProfileByUsername(username: string): Promise<ProfileWithBadges | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      badges:user_badges(*)
    `)
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as ProfileWithBadges;
}

export async function getProfileById(id: string): Promise<ProfileWithBadges | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      badges:user_badges(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as ProfileWithBadges;
}

export async function getOnlineUsers(limit = 20): Promise<Profile[]> {
  // In a real app, you'd track online status via presence or last_seen timestamp
  // For now, just return recent users
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching online users:', error);
    return [];
  }

  return data;
}

export async function getForumStats() {
  const supabase = await createClient();

  // Get total counts
  const [
    { count: totalMembers },
    { count: totalThreads },
    { count: totalPosts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('threads').select('*', { count: 'exact', head: true }),
    supabase.from('replies').select('*', { count: 'exact', head: true }),
  ]);

  // Get newest member
  const { data: newestMember } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalMembers: totalMembers || 0,
    totalThreads: totalThreads || 0,
    totalPosts: (totalThreads || 0) + (totalPosts || 0), // Threads + Replies
    onlineNow: Math.floor(Math.random() * 100) + 50, // Placeholder - implement real presence
    newestMember: newestMember || null,
  };
}
