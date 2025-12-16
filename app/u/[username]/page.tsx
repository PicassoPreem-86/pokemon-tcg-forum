'use client';

import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { getUserByUsername, User, UserBadge } from '@/lib/mock-data/users';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';

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
  member: { color: '#6B7280', icon: null, label: 'Member' }
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

// Generate mock recent activity
function generateRecentActivity(user: User) {
  const activities = [
    { type: 'post', title: `Posted in "Best budget deck for local tournaments?"`, time: '2 hours ago', icon: <MessageSquare size={16} /> },
    { type: 'like', title: `Liked a post by VintageCollector`, time: '5 hours ago', icon: <Heart size={16} /> },
    { type: 'thread', title: `Started thread "My latest pulls from Surging Sparks"`, time: '1 day ago', icon: <MessageCircle size={16} /> },
    { type: 'reply', title: `Replied to "PSA vs CGC comparison"`, time: '2 days ago', icon: <MessageSquare size={16} /> },
    { type: 'badge', title: `Earned the "Active Member" badge`, time: '1 week ago', icon: <Award size={16} /> },
  ];
  return activities.slice(0, 5);
}

// Generate mock recent threads
function generateRecentThreads(user: User) {
  const threads = [
    { id: '1', title: 'My complete Base Set collection journey', category: 'Collecting', replies: 42, views: 1234, isHot: true },
    { id: '2', title: 'Best way to store slabbed cards?', category: 'General', replies: 28, views: 567, isHot: false },
    { id: '3', title: 'Surging Sparks pull rates discussion', category: 'News', replies: 89, views: 2341, isHot: true },
    { id: '4', title: 'Looking for Base Set trades', category: 'Trading', replies: 15, views: 234, isHot: false },
  ];
  return threads;
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
        <span className="profile-badge-desc">{badge.description}</span>
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
  const user = getUserByUsername(username);
  const [activeTab, setActiveTab] = useState<'activity' | 'threads' | 'badges'>('activity');

  if (!user) {
    return (
      <div className="content-container">
        <div className="profile-not-found">
          <div className="profile-not-found-icon">
            <Users size={64} />
          </div>
          <h1>User Not Found</h1>
          <p>The user "{username}" doesn't exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const trainerRank = getTrainerRank(user.postCount);
  const roleInfo = roleConfig[user.role];
  const daysSinceJoin = getDaysSinceJoin(user.joinDate);
  const recentActivity = generateRecentActivity(user);
  const recentThreads = generateRecentThreads(user);

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
                src="/images/avatars/default.png"
                alt={user.displayName}
                width={120}
                height={120}
                className="profile-avatar-img"
              />
              {user.isOnline && <span className="profile-online-badge" />}
            </div>
            {user.role !== 'member' && (
              <div className="profile-role-badge" style={{ backgroundColor: roleInfo.color }}>
                {roleInfo.icon}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="profile-details">
            <div className="profile-name-row">
              <h1 className="profile-display-name">{user.displayName}</h1>
              {user.isOnline ? (
                <span className="profile-status online">Online</span>
              ) : (
                <span className="profile-status offline">Offline</span>
              )}
            </div>

            <p className="profile-username">@{user.username}</p>

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
              {user.role !== 'member' && (
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
            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            {/* Meta Info */}
            <div className="profile-meta">
              {user.location && (
                <div className="profile-meta-item">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="profile-meta-item">
                <Calendar size={16} />
                <span>Joined {formatJoinDate(user.joinDate)}</span>
              </div>
              <div className="profile-meta-item">
                <Clock size={16} />
                <span>{daysSinceJoin} days on forum</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="btn btn-primary">
              <UserPlus size={16} />
              Follow
            </button>
            <button className="btn btn-secondary">
              <Mail size={16} />
              Message
            </button>
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
          value={formatNumber(user.postCount)}
          label="Posts"
          color="#3B82F6"
        />
        <StatCard
          icon={<Star size={24} />}
          value={formatNumber(user.reputation)}
          label="Reputation"
          color="#F59E0B"
        />
        <StatCard
          icon={<Heart size={24} />}
          value={formatNumber(Math.floor(user.reputation * 0.8))}
          label="Likes Received"
          color="#EF4444"
        />
        <StatCard
          icon={<Trophy size={24} />}
          value={user.badges.length.toString()}
          label="Badges"
          color="#8B5CF6"
        />
        <StatCard
          icon={<Users size={24} />}
          value={formatNumber(Math.floor(user.postCount * 0.3))}
          label="Followers"
          color="#10B981"
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
          Threads
        </button>
        <button
          className={`profile-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <Award size={16} />
          Badges ({user.badges.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="profile-activity">
            {recentActivity.map((activity, index) => (
              <div key={index} className="profile-activity-item">
                <div className="profile-activity-icon">
                  {activity.icon}
                </div>
                <div className="profile-activity-content">
                  <p className="profile-activity-title">{activity.title}</p>
                  <span className="profile-activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Threads Tab */}
        {activeTab === 'threads' && (
          <div className="profile-threads">
            {recentThreads.map((thread) => (
              <Link key={thread.id} href={`/t/${thread.id}`} className="profile-thread-item">
                <div className="profile-thread-content">
                  <div className="profile-thread-title-row">
                    {thread.isHot && (
                      <span className="badge badge-hot">
                        <Flame size={12} /> Hot
                      </span>
                    )}
                    <h3 className="profile-thread-title">{thread.title}</h3>
                  </div>
                  <span className="profile-thread-category">{thread.category}</span>
                </div>
                <div className="profile-thread-stats">
                  <div className="profile-thread-stat">
                    <MessageSquare size={14} />
                    {thread.replies}
                  </div>
                  <div className="profile-thread-stat">
                    <Eye size={14} />
                    {formatNumber(thread.views)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="profile-badges">
            {user.badges.length > 0 ? (
              user.badges.map((badge) => (
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
                {(user.postCount / daysSinceJoin).toFixed(1)}
              </span>
            </div>
            <div className="profile-quick-stat">
              <span className="quick-stat-label">Rep per post</span>
              <span className="quick-stat-value">
                {(user.reputation / user.postCount).toFixed(2)}
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
        {user.badges.length > 0 && (
          <div className="profile-widget">
            <h3 className="profile-widget-title">Featured Badges</h3>
            <div className="profile-featured-badges">
              {user.badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="profile-featured-badge"
                  style={{ backgroundColor: `${badge.color}20`, borderColor: badge.color }}
                  title={badge.description}
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
      </div>
    </div>
  );
}
