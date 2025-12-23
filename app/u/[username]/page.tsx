'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  MessageSquare,
  Star,
  Heart,
  Trophy,
  Crown,
  Shield,
  Award,
  Sparkles,
  TrendingUp,
  ArrowLeftRight,
  Zap,
  Eye,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Mail,
  UserPlus,
  MoreHorizontal,
  Flame,
  MessageCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';
import ReportButton from '@/components/ReportButton';
import type { Profile, UserBadge } from '@/lib/supabase/database.types';

// Extended profile type with badges
type ProfileWithBadges = Profile & {
  badges: UserBadge[];
};

// Icon mapping for badges
const badgeIconMap: Record<string, React.ReactNode> = {
  Crown: <Crown size={14} />,
  Shield: <Shield size={14} />,
  Star: <Star size={14} />,
  Award: <Award size={14} />,
  Heart: <Heart size={14} />,
  CheckCircle: <CheckCircle size={14} />,
  TrendingUp: <TrendingUp size={14} />,
  ArrowLeftRight: <ArrowLeftRight size={14} />,
  Zap: <Zap size={14} />,
  Sparkles: <Sparkles size={14} />,
  Eye: <Eye size={14} />,
  BookOpen: <BookOpen size={14} />,
  Users: <Users size={14} />,
  Gem: <Sparkles size={14} />,
  Smartphone: <MessageSquare size={14} />,
  Brain: <Sparkles size={14} />
};

// Role configuration
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={16} />, label: 'Administrator' },
  moderator: { color: '#8B5CF6', icon: <Shield size={16} />, label: 'Moderator' },
  vip: { color: '#F59E0B', icon: <Star size={16} />, label: 'VIP Member' },
  member: { color: '#6B7280', icon: null, label: 'Member' },
  newbie: { color: '#10B981', icon: null, label: 'New Trainer' }
};

// Format join date
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Calculate days since joining
function getDaysSinceJoin(dateString: string): number {
  const joinDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Badge component
function BadgeCard({ badge }: { badge: UserBadge }) {
  return (
    <div className="profile-badge" style={{ borderColor: badge.color }}>
      <div className="profile-badge-icon" style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>
        {badgeIconMap[badge.icon] || <Star size={14} />}
      </div>
      <div className="profile-badge-info">
        <span className="profile-badge-name" style={{ color: badge.color }}>{badge.name}</span>
        <span className="profile-badge-desc">Awarded on {formatJoinDate(badge.awarded_at)}</span>
      </div>
    </div>
  );
}

// Stats card component
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color?: string }) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-icon" style={{ color: color || '#FFCC00' }}>
        {icon}
      </div>
      <div className="profile-stat-value">{value}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileWithBadges | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'threads' | 'badges'>('activity');
  const [threads, setThreads] = useState<Array<{
    id: string;
    slug: string;
    title: string;
    category_name: string;
    post_count: number;
    view_count: number;
    is_hot: boolean;
  }>>([]);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.username === username;

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      console.log('Profile page: Fetching profile for username:', username);
      const supabase = getSupabaseClient();

      // Fetch profile with badges
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          badges:user_badges(*)
        `)
        .eq('username', username)
        .single() as { data: ProfileWithBadges | null; error: Error | null };

      console.log('Profile page: Query result:', { profileData: profileData?.username, error: profileError?.message });

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        setError(`User "${username}" not found`);
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user's threads
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: threadData } = await (supabase as any)
        .from('threads')
        .select(`
          id,
          slug,
          title,
          post_count,
          view_count,
          is_hot,
          category:categories(name)
        `)
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (threadData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setThreads(threadData.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          title: t.title,
          category_name: t.category?.name || 'General',
          post_count: t.post_count,
          view_count: t.view_count,
          is_hot: t.is_hot
        })));
      }

      setIsLoading(false);
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Loading state
  if (isLoading) {
    return (
      <div className="content-container">
        <div className="profile-loading">
          <Loader2 size={48} className="spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="content-container">
        <div className="profile-not-found">
          <div className="profile-not-found-icon">
            <Users size={64} />
          </div>
          <h1>User Not Found</h1>
          <p>The user &quot;{username}&quot; doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const trainerRank = getTrainerRank(profile.post_count || 0);
  const roleInfo = roleConfig[profile.role] || roleConfig.member;
  const daysSinceJoin = getDaysSinceJoin(profile.created_at);

  return (
    <div className="content-container">
      {/* Profile Header */}
      <div className="profile-header">
        {/* Cover Image */}
        <div className="profile-cover">
          <div className="profile-cover-pattern" />
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          {/* Avatar */}
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <Image
                src={profile.avatar_url || '/images/avatars/default.png'}
                alt={profile.display_name || profile.username}
                width={120}
                height={120}
                className="profile-avatar-img"
              />
            </div>
            {profile.role !== 'member' && profile.role !== 'newbie' && (
              <div className="profile-role-badge" style={{ backgroundColor: roleInfo.color }}>
                {roleInfo.icon}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="profile-details">
            <div className="profile-name-row">
              <h1 className="profile-display-name">{profile.display_name || profile.username}</h1>
            </div>

            <p className="profile-username">@{profile.username}</p>

            <div className="profile-ranks">
              {/* Trainer Rank */}
              <div
                className="profile-trainer-rank"
                style={{
                  backgroundColor: `${trainerRank.color}20`,
                  color: trainerRank.color,
                  borderColor: `${trainerRank.color}40`
                }}
              >
                <Sparkles size={14} />
                {trainerRank.name}
              </div>

              {/* Role */}
              {profile.role !== 'member' && profile.role !== 'newbie' && (
                <div
                  className="profile-role-tag"
                  style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                >
                  {roleInfo.icon}
                  {roleInfo.label}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="profile-bio">{profile.bio}</p>
            )}

            {/* Meta Info */}
            <div className="profile-meta">
              {profile.location && (
                <div className="profile-meta-item">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="profile-meta-item">
                <Calendar size={16} />
                <span>Joined {formatJoinDate(profile.created_at)}</span>
              </div>
              <div className="profile-meta-item">
                <Clock size={16} />
                <span>{daysSinceJoin} days on forum</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {isOwnProfile ? (
              <Link href="/settings" className="btn btn-primary">
                <Settings size={16} />
                Edit Profile
              </Link>
            ) : (
              <>
                <button className="btn btn-primary">
                  <UserPlus size={16} />
                  Follow
                </button>
                <button className="btn btn-secondary">
                  <Mail size={16} />
                  Message
                </button>
              </>
            )}
            {!isOwnProfile && (
              <ReportButton
                targetType="user"
                targetId={profile.id}
                targetTitle={profile.display_name || profile.username}
                iconOnly
                className="btn btn-ghost"
              />
            )}
            <button className="btn btn-ghost">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <StatCard
          icon={<MessageSquare size={24} />}
          value={formatNumber(profile.post_count || 0)}
          label="Posts"
          color="#3B82F6"
        />
        <StatCard
          icon={<Star size={24} />}
          value={formatNumber(profile.reputation || 0)}
          label="Reputation"
          color="#F59E0B"
        />
        <StatCard
          icon={<Heart size={24} />}
          value={formatNumber(Math.floor((profile.reputation || 0) * 0.8))}
          label="Likes Received"
          color="#EF4444"
        />
        <StatCard
          icon={<Trophy size={24} />}
          value={(profile.badges?.length || 0).toString()}
          label="Badges"
          color="#8B5CF6"
        />
      </div>

      {/* Content Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Clock size={16} />
          Recent Activity
        </button>
        <button
          className={`profile-tab ${activeTab === 'threads' ? 'active' : ''}`}
          onClick={() => setActiveTab('threads')}
        >
          <MessageCircle size={16} />
          Threads ({threads.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <Award size={16} />
          Badges ({profile.badges?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="profile-activity">
            {threads.length > 0 ? (
              threads.slice(0, 5).map((thread) => (
                <div key={thread.id} className="profile-activity-item">
                  <div className="profile-activity-icon">
                    <MessageCircle size={16} />
                  </div>
                  <div className="profile-activity-content">
                    <Link href={`/t/${thread.slug}`} className="profile-activity-title">
                      Started thread &quot;{thread.title}&quot;
                    </Link>
                    <span className="profile-activity-time">in {thread.category_name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="profile-no-activity">
                <MessageSquare size={48} />
                <p>No recent activity</p>
                <span>This user hasn&apos;t posted yet</span>
              </div>
            )}
          </div>
        )}

        {/* Threads Tab */}
        {activeTab === 'threads' && (
          <div className="profile-threads">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <Link key={thread.id} href={`/t/${thread.slug}`} className="profile-thread-item">
                  <div className="profile-thread-content">
                    <div className="profile-thread-title-row">
                      {thread.is_hot && (
                        <span className="badge badge-hot">
                          <Flame size={12} /> Hot
                        </span>
                      )}
                      <h3 className="profile-thread-title">{thread.title}</h3>
                    </div>
                    <span className="profile-thread-category">{thread.category_name}</span>
                  </div>
                  <div className="profile-thread-stats">
                    <div className="profile-thread-stat">
                      <MessageSquare size={14} />
                      {thread.post_count}
                    </div>
                    <div className="profile-thread-stat">
                      <Eye size={14} />
                      {formatNumber(thread.view_count)}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="profile-no-threads">
                <MessageCircle size={48} />
                <p>No threads yet</p>
                <span>This user hasn&apos;t started any threads</span>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="profile-badges">
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))
            ) : (
              <div className="profile-no-badges">
                <Award size={48} />
                <p>No badges earned yet</p>
                <span>Participate in the community to earn badges!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Widgets */}
      <div className="profile-sidebar">
        {/* Quick Stats */}
        <div className="profile-widget">
          <h3 className="profile-widget-title">Quick Stats</h3>
          <div className="profile-quick-stats">
            <div className="profile-quick-stat">
              <span className="quick-stat-label">Posts per day</span>
              <span className="quick-stat-value">
                {daysSinceJoin > 0 ? ((profile.post_count || 0) / daysSinceJoin).toFixed(1) : '0'}
              </span>
            </div>
            <div className="profile-quick-stat">
              <span className="quick-stat-label">Rep per post</span>
              <span className="quick-stat-value">
                {(profile.post_count || 0) > 0 ? ((profile.reputation || 0) / (profile.post_count || 1)).toFixed(2) : '0'}
              </span>
            </div>
            <div className="profile-quick-stat">
              <span className="quick-stat-label">Member for</span>
              <span className="quick-stat-value">
                {Math.floor(daysSinceJoin / 30)} months
              </span>
            </div>
          </div>
        </div>

        {/* Top Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="profile-widget">
            <h3 className="profile-widget-title">Featured Badges</h3>
            <div className="profile-featured-badges">
              {profile.badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="profile-featured-badge"
                  style={{ backgroundColor: `${badge.color}20`, borderColor: badge.color }}
                  title={badge.name}
                >
                  <span style={{ color: badge.color }}>
                    {badgeIconMap[badge.icon] || <Star size={14} />}
                  </span>
                  <span style={{ color: badge.color }}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature */}
        {profile.signature && (
          <div className="profile-widget">
            <h3 className="profile-widget-title">Signature</h3>
            <div className="profile-signature">
              {profile.signature}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
