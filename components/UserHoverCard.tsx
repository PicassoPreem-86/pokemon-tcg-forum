'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  Shield,
  Star,
  Sparkles,
  MessageSquare,
  Heart,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { getUserByUsername, User } from '@/lib/mock-data/users';
import { getTrainerRank } from '@/lib/trainer-ranks';

interface UserHoverCardProps {
  username: string;
  children: React.ReactNode;
}

// Role badge configuration
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={10} />, label: 'Admin' },
  moderator: { color: '#8B5CF6', icon: <Shield size={10} />, label: 'Mod' },
  vip: { color: '#F59E0B', icon: <Star size={10} />, label: 'VIP' },
  member: { color: '#6B7280', icon: null, label: '' }
};

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && !user) {
      const userData = getUserByUsername(username);
      setUser(userData || null);
    }
  }, [isVisible, username, user]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const cardHeight = 280; // Approximate card height

        // Position above if not enough space below
        const showAbove = rect.bottom + cardHeight > viewportHeight;

        setPosition({
          top: showAbove ? rect.top - cardHeight - 8 : rect.bottom + 8,
          left: Math.max(10, Math.min(rect.left, window.innerWidth - 320))
        });
        setIsVisible(true);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleCardMouseLeave = () => {
    setIsVisible(false);
  };

  if (!user && isVisible) {
    return (
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
    );
  }

  const trainerRank = user ? getTrainerRank(user.postCount) : null;
  const roleInfo = user ? roleConfig[user.role] || roleConfig.member : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="user-hover-trigger"
      >
        {children}
      </span>

      {isVisible && user && (
        <div
          ref={cardRef}
          className="user-hover-card"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Header */}
          <div className="hover-card-header">
            <div className="hover-card-avatar">
              <Image
                src="/images/avatars/default.png"
                alt={user.displayName}
                width={56}
                height={56}
              />
              {user.isOnline && <span className="online-indicator" />}
              {user.role !== 'member' && roleInfo && (
                <span
                  className="hover-card-role-badge"
                  style={{ backgroundColor: roleInfo.color }}
                >
                  {roleInfo.icon}
                </span>
              )}
            </div>

            <div className="hover-card-info">
              <div className="hover-card-name-row">
                <span className="hover-card-name">{user.displayName}</span>
                {user.role !== 'member' && roleInfo && (
                  <span
                    className="hover-card-role-tag"
                    style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                  >
                    {roleInfo.label}
                  </span>
                )}
              </div>
              <span className="hover-card-username">@{user.username}</span>

              {trainerRank && (
                <div
                  className="hover-card-rank"
                  style={{
                    backgroundColor: `${trainerRank.color}20`,
                    color: trainerRank.color
                  }}
                >
                  <Sparkles size={10} />
                  {trainerRank.name}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="hover-card-bio">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="hover-card-stats">
            <div className="hover-card-stat">
              <MessageSquare size={14} />
              <span className="stat-value">{formatNumber(user.postCount)}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="hover-card-stat">
              <Heart size={14} />
              <span className="stat-value">{formatNumber(user.reputation)}</span>
              <span className="stat-label">rep</span>
            </div>
            <div className="hover-card-stat">
              <Calendar size={14} />
              <span className="stat-value">{formatJoinDate(user.joinDate)}</span>
            </div>
          </div>

          {/* Meta */}
          {user.location && (
            <div className="hover-card-meta">
              <MapPin size={12} />
              {user.location}
            </div>
          )}

          {/* Footer */}
          <Link href={`/u/${user.username}`} className="hover-card-link">
            View Profile
            <ExternalLink size={12} />
          </Link>
        </div>
      )}
    </>
  );
}
