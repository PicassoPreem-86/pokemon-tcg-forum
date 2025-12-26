'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  MapPin,
  FileText,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  Bell,
  Eye,
  Palette,
  CreditCard,
  Lock,
  Smartphone,
  LogOut,
  Trash2,
  Download,
  Globe,
  Twitter,
  MessageCircle,
  Youtube,
  Link as LinkIcon,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Users,
  Heart,
  Ban,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { updateProfile } from '@/lib/actions/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { useSettingsStore, SettingsState } from '@/lib/settings-store';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy' | 'appearance' | 'trading';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  { id: 'account', label: 'Account & Security', icon: <Shield size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  { id: 'trading', label: 'Trading & Collection', icon: <CreditCard size={18} /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, refreshUser } = useAuth();
  const settings = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [signature, setSignature] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [youtube, setYoutube] = useState('');
  const [favoriteTcg, setFavoriteTcg] = useState('pokemon');

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Load user data into form
  // Note: website, twitter, discord, youtube, and favorite_tcg are extended profile fields
  // that may not exist in the database yet. They're stored client-side for now.
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setSignature(user.signature || '');

      // Load extended profile fields from localStorage
      if (typeof window !== 'undefined') {
        try {
          const extendedData = localStorage.getItem('tcg-extended-profile');
          if (extendedData) {
            const parsed = JSON.parse(extendedData);
            setWebsite(parsed.website || '');
            setTwitter(parsed.twitter || '');
            setDiscord(parsed.discord || '');
            setYoutube(parsed.youtube || '');
            setFavoriteTcg(parsed.favoriteTcg || 'pokemon');
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Only submit fields that are currently supported by the API
      // Extended fields (website, twitter, discord, youtube, favoriteTcg)
      // are stored client-side for now and can be added when DB is extended
      const result = await updateProfile({
        displayName,
        bio,
        location,
        signature,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
        showErrorToast('Update Failed', result.error);
      } else {
        // Store extended fields in localStorage for now
        if (typeof window !== 'undefined') {
          localStorage.setItem('tcg-extended-profile', JSON.stringify({
            website,
            twitter,
            discord,
            youtube,
            favoriteTcg,
          }));
        }
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        showSuccessToast('Profile Updated', 'Your changes have been saved');
        await refreshUser();
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      showErrorToast('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <Loader2 size={48} className="spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-container-full">
        {/* Header */}
        <div className="settings-header">
          <Link href={`/u/${user.username}`} className="settings-back">
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
          <h1><Settings size={28} /> Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar Tabs */}
          <nav className="settings-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="settings-content">
            {message && (
              <div className={`settings-message ${message.type}`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                displayName={displayName}
                setDisplayName={setDisplayName}
                bio={bio}
                setBio={setBio}
                location={location}
                setLocation={setLocation}
                signature={signature}
                setSignature={setSignature}
                website={website}
                setWebsite={setWebsite}
                twitter={twitter}
                setTwitter={setTwitter}
                discord={discord}
                setDiscord={setDiscord}
                youtube={youtube}
                setYoutube={setYoutube}
                favoriteTcg={favoriteTcg}
                setFavoriteTcg={setFavoriteTcg}
                isLoading={isLoading}
                onSubmit={handleProfileSubmit}
              />
            )}

            {/* Account & Security Tab */}
            {activeTab === 'account' && (
              <AccountTab user={user} />
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <NotificationsTab settings={settings} />
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <PrivacyTab settings={settings} />
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <AppearanceTab settings={settings} />
            )}

            {/* Trading Tab */}
            {activeTab === 'trading' && (
              <TradingTab settings={settings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
interface ProfileTabProps {
  user: {
    username: string;
    email: string;
    avatar_url?: string | null;
    display_name?: string | null;
  };
  displayName: string;
  setDisplayName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  signature: string;
  setSignature: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  twitter: string;
  setTwitter: (v: string) => void;
  discord: string;
  setDiscord: (v: string) => void;
  youtube: string;
  setYoutube: (v: string) => void;
  favoriteTcg: string;
  setFavoriteTcg: (v: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function ProfileTab({
  user,
  displayName,
  setDisplayName,
  bio,
  setBio,
  location,
  setLocation,
  signature,
  setSignature,
  website,
  setWebsite,
  twitter,
  setTwitter,
  discord,
  setDiscord,
  youtube,
  setYoutube,
  favoriteTcg,
  setFavoriteTcg,
  isLoading,
  onSubmit,
}: ProfileTabProps) {
  return (
    <form onSubmit={onSubmit} className="settings-form">
      {/* Avatar Section */}
      <div className="settings-section">
        <h2><Camera size={20} /> Profile Picture</h2>
        <div className="settings-avatar-section">
          <div className="settings-avatar">
            <Image
              src={user.avatar_url || '/images/avatars/default.png'}
              alt={user.display_name || user.username}
              width={100}
              height={100}
            />
            <button type="button" className="settings-avatar-edit">
              <Camera size={16} />
            </button>
          </div>
          <div className="settings-avatar-info">
            <p>Upload a new avatar. Max size 2MB. JPG, PNG or GIF.</p>
            <div className="settings-avatar-buttons">
              <button type="button" className="btn btn-secondary btn-sm">
                <Camera size={16} />
                Upload New
              </button>
              <button type="button" className="btn btn-ghost btn-sm">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="settings-section">
        <h2><User size={20} /> Basic Information</h2>

        <div className="settings-field">
          <label htmlFor="username">Username</label>
          <div className="settings-input-wrapper">
            <User size={18} className="settings-input-icon" />
            <input
              type="text"
              id="username"
              value={user.username}
              disabled
              className="settings-input disabled"
            />
          </div>
          <span className="settings-field-hint">Username cannot be changed</span>
        </div>

        <div className="settings-field">
          <label htmlFor="email">Email</label>
          <div className="settings-input-wrapper">
            <Mail size={18} className="settings-input-icon" />
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="settings-input disabled"
            />
          </div>
          <span className="settings-field-hint">Email is managed by your account provider</span>
        </div>

        <div className="settings-field">
          <label htmlFor="displayName">Display Name</label>
          <div className="settings-input-wrapper">
            <Sparkles size={18} className="settings-input-icon" />
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be known"
              maxLength={50}
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="location">Location</label>
          <div className="settings-input-wrapper">
            <MapPin size={18} className="settings-input-icon" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              maxLength={100}
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="bio">Bio</label>
          <div className="settings-textarea-wrapper">
            <FileText size={18} className="settings-input-icon" />
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your collection..."
              maxLength={500}
              rows={4}
              disabled={isLoading}
              className="settings-textarea"
            />
          </div>
          <span className="settings-field-hint">{bio.length}/500 characters</span>
        </div>

        <div className="settings-field">
          <label htmlFor="favoriteTcg">Favorite TCG</label>
          <div className="settings-select-wrapper">
            <CreditCard size={18} className="settings-input-icon" />
            <select
              id="favoriteTcg"
              value={favoriteTcg}
              onChange={(e) => setFavoriteTcg(e.target.value)}
              disabled={isLoading}
              className="settings-select"
            >
              <option value="pokemon">Pokemon TCG</option>
              <option value="yugioh">Yu-Gi-Oh!</option>
              <option value="mtg">Magic: The Gathering</option>
              <option value="onepiece">One Piece Card Game</option>
              <option value="lorcana">Disney Lorcana</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="settings-section">
        <h2><Globe size={20} /> Social Links</h2>

        <div className="settings-field">
          <label htmlFor="website">Website</label>
          <div className="settings-input-wrapper">
            <LinkIcon size={18} className="settings-input-icon" />
            <input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="twitter">Twitter / X</label>
          <div className="settings-input-wrapper">
            <Twitter size={18} className="settings-input-icon" />
            <input
              type="text"
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username"
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="discord">Discord</label>
          <div className="settings-input-wrapper">
            <MessageCircle size={18} className="settings-input-icon" />
            <input
              type="text"
              id="discord"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="username#1234"
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="youtube">YouTube</label>
          <div className="settings-input-wrapper">
            <Youtube size={18} className="settings-input-icon" />
            <input
              type="text"
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="Channel URL or @handle"
              disabled={isLoading}
              className="settings-input"
            />
          </div>
        </div>
      </div>

      {/* Forum Signature Section */}
      <div className="settings-section">
        <h2><FileText size={20} /> Forum Signature</h2>
        <div className="settings-field">
          <label htmlFor="signature">Signature</label>
          <div className="settings-textarea-wrapper">
            <FileText size={18} className="settings-input-icon" />
            <textarea
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Appears at the bottom of your posts"
              maxLength={200}
              rows={2}
              disabled={isLoading}
              className="settings-textarea"
            />
          </div>
          <span className="settings-field-hint">{signature.length}/200 characters • Supports basic formatting</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="settings-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Account & Security Tab
function AccountTab({ user }: { user: { email: string } }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="settings-form">
      {/* Password Section */}
      <div className="settings-section">
        <h2><Lock size={20} /> Password</h2>
        <p className="settings-section-desc">Change your password to keep your account secure</p>

        <div className="settings-field">
          <label htmlFor="currentPassword">Current Password</label>
          <div className="settings-input-wrapper">
            <Lock size={18} className="settings-input-icon" />
            <input
              type="password"
              id="currentPassword"
              placeholder="Enter current password"
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="newPassword">New Password</label>
          <div className="settings-input-wrapper">
            <Lock size={18} className="settings-input-icon" />
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              className="settings-input"
            />
          </div>
          <span className="settings-field-hint">Minimum 8 characters with letters and numbers</span>
        </div>

        <div className="settings-field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="settings-input-wrapper">
            <Lock size={18} className="settings-input-icon" />
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              className="settings-input"
            />
          </div>
        </div>

        <button type="button" className="btn btn-secondary">
          <Lock size={16} />
          Update Password
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="settings-section">
        <h2><Smartphone size={20} /> Two-Factor Authentication</h2>
        <p className="settings-section-desc">Add an extra layer of security to your account</p>

        <div className="settings-toggle-card">
          <div className="settings-toggle-info">
            <h3>Authenticator App</h3>
            <p>Use an authenticator app like Google Authenticator or Authy</p>
          </div>
          <button type="button" className="btn btn-secondary">
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="settings-section">
        <h2><Users size={20} /> Connected Accounts</h2>
        <p className="settings-section-desc">Manage your linked social accounts</p>

        <div className="settings-connected-accounts">
          <div className="settings-connected-account">
            <div className="settings-connected-account-info">
              <div className="settings-connected-account-icon google">G</div>
              <div>
                <h4>Google</h4>
                <p>{user.email}</p>
              </div>
            </div>
            <span className="settings-connected-badge">Connected</span>
          </div>

          <div className="settings-connected-account">
            <div className="settings-connected-account-info">
              <div className="settings-connected-account-icon discord">D</div>
              <div>
                <h4>Discord</h4>
                <p>Not connected</p>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm">Connect</button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="settings-section">
        <h2><Monitor size={20} /> Active Sessions</h2>
        <p className="settings-section-desc">Manage devices where you&apos;re logged in</p>

        <div className="settings-sessions">
          <div className="settings-session current">
            <div className="settings-session-info">
              <Monitor size={24} />
              <div>
                <h4>Current Session</h4>
                <p>Chrome on macOS • Last active now</p>
              </div>
            </div>
            <span className="settings-session-badge">This device</span>
          </div>
        </div>

        <button type="button" className="btn btn-ghost">
          <LogOut size={16} />
          Sign Out All Other Sessions
        </button>
      </div>

      {/* Data & Privacy */}
      <div className="settings-section">
        <h2><Download size={20} /> Your Data</h2>
        <p className="settings-section-desc">Download or delete your account data</p>

        <div className="settings-data-actions">
          <button type="button" className="btn btn-secondary">
            <Download size={16} />
            Download My Data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-danger">
        <h2><AlertCircle size={20} /> Danger Zone</h2>
        <p className="settings-section-desc">Irreversible actions for your account</p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        ) : (
          <div className="settings-delete-confirm">
            <p><strong>Are you sure?</strong> This action cannot be undone. All your posts, threads, and data will be permanently deleted.</p>
            <div className="settings-delete-buttons">
              <button type="button" className="btn btn-danger">
                Yes, Delete My Account
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notifications Tab
interface NotificationsTabProps {
  settings: SettingsState;
}

function NotificationsTab({ settings }: NotificationsTabProps) {
  return (
    <div className="settings-form">
      {/* Email Notifications */}
      <div className="settings-section">
        <h2><Mail size={20} /> Email Notifications</h2>
        <p className="settings-section-desc">Choose what emails you&apos;d like to receive</p>

        <div className="settings-toggles">
          <ToggleItem
            label="Thread Replies"
            description="Get notified when someone replies to your threads"
            checked={settings.emailThreadReplies}
            onChange={settings.setEmailThreadReplies}
          />
          <ToggleItem
            label="Mentions"
            description="Get notified when someone mentions you"
            checked={settings.emailMentions}
            onChange={settings.setEmailMentions}
          />
          <ToggleItem
            label="Direct Messages"
            description="Get notified when you receive a private message"
            checked={settings.emailDirectMessages}
            onChange={settings.setEmailDirectMessages}
          />
          <ToggleItem
            label="Weekly Digest"
            description="Receive a weekly summary of forum activity"
            checked={settings.emailWeeklyDigest}
            onChange={settings.setEmailWeeklyDigest}
          />
          <ToggleItem
            label="News & Updates"
            description="Receive announcements about new features and updates"
            checked={settings.emailNewsUpdates}
            onChange={settings.setEmailNewsUpdates}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="settings-section">
        <h2><Bell size={20} /> Push Notifications</h2>
        <p className="settings-section-desc">Receive notifications in your browser</p>

        <div className="settings-toggles">
          <ToggleItem
            label="Enable Push Notifications"
            description="Get real-time notifications in your browser"
            checked={settings.pushNotifications}
            onChange={settings.setPushNotifications}
          />
        </div>
      </div>

      {/* Sound */}
      <div className="settings-section">
        <h2>{settings.notificationSound ? <Volume2 size={20} /> : <VolumeX size={20} />} Sound</h2>
        <p className="settings-section-desc">Audio settings for notifications</p>

        <div className="settings-toggles">
          <ToggleItem
            label="Notification Sound"
            description="Play a sound when you receive a notification"
            checked={settings.notificationSound}
            onChange={settings.setNotificationSound}
          />
        </div>
      </div>
    </div>
  );
}

// Privacy Tab
interface PrivacyTabProps {
  settings: SettingsState;
}

function PrivacyTab({ settings }: PrivacyTabProps) {
  return (
    <div className="settings-form">
      {/* Profile Visibility */}
      <div className="settings-section">
        <h2><Eye size={20} /> Profile Visibility</h2>
        <p className="settings-section-desc">Control who can see your profile information</p>

        <div className="settings-field">
          <label htmlFor="profileVisibility">Who can view your profile?</label>
          <div className="settings-select-wrapper">
            <Eye size={18} className="settings-input-icon" />
            <select
              id="profileVisibility"
              value={settings.profileVisibility}
              onChange={(e) => settings.setProfileVisibility(e.target.value as 'public' | 'members' | 'private')}
              className="settings-select"
            >
              <option value="public">Everyone (Public)</option>
              <option value="members">Members Only</option>
              <option value="private">Only Me (Private)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="settings-section">
        <h2><Users size={20} /> Information Display</h2>
        <p className="settings-section-desc">Choose what information to show on your profile</p>

        <div className="settings-toggles">
          <ToggleItem
            label="Show Online Status"
            description="Let others see when you're online"
            checked={settings.showOnlineStatus}
            onChange={settings.setShowOnlineStatus}
          />
          <ToggleItem
            label="Show Email"
            description="Display your email on your profile"
            checked={settings.showEmail}
            onChange={settings.setShowEmail}
          />
          <ToggleItem
            label="Show Location"
            description="Display your location on your profile"
            checked={settings.showLocation}
            onChange={settings.setShowLocation}
          />
          <ToggleItem
            label="Show Activity Feed"
            description="Let others see your recent forum activity"
            checked={settings.showActivityFeed}
            onChange={settings.setShowActivityFeed}
          />
        </div>
      </div>

      {/* Direct Messages */}
      <div className="settings-section">
        <h2><MessageCircle size={20} /> Direct Messages</h2>
        <p className="settings-section-desc">Control who can send you private messages</p>

        <div className="settings-field">
          <label htmlFor="allowDMs">Who can message you?</label>
          <div className="settings-select-wrapper">
            <MessageCircle size={18} className="settings-input-icon" />
            <select
              id="allowDMs"
              value={settings.allowDirectMessages}
              onChange={(e) => settings.setAllowDirectMessages(e.target.value as 'everyone' | 'following' | 'nobody')}
              className="settings-select"
            >
              <option value="everyone">Everyone</option>
              <option value="following">People I Follow</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="settings-section">
        <h2><Ban size={20} /> Blocked Users</h2>
        <p className="settings-section-desc">Manage users you&apos;ve blocked</p>

        <div className="settings-blocked-list">
          <p className="settings-empty">You haven&apos;t blocked anyone yet.</p>
        </div>
      </div>
    </div>
  );
}

// Appearance Tab
interface AppearanceTabProps {
  settings: SettingsState;
}

function AppearanceTab({ settings }: AppearanceTabProps) {
  return (
    <div className="settings-form">
      {/* Theme */}
      <div className="settings-section">
        <h2><Palette size={20} /> Theme</h2>
        <p className="settings-section-desc">Choose your preferred color scheme</p>

        <div className="settings-theme-options">
          <button
            type="button"
            className={`settings-theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => settings.setTheme('dark')}
          >
            <Moon size={24} />
            <span>Dark</span>
          </button>
          <button
            type="button"
            className={`settings-theme-option ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => settings.setTheme('light')}
          >
            <Sun size={24} />
            <span>Light</span>
          </button>
          <button
            type="button"
            className={`settings-theme-option ${settings.theme === 'system' ? 'active' : ''}`}
            onClick={() => settings.setTheme('system')}
          >
            <Monitor size={24} />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="settings-section">
        <h2><Sparkles size={20} /> Accent Color</h2>
        <p className="settings-section-desc">Choose your preferred accent color</p>

        <div className="settings-color-options">
          {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((color) => (
            <button
              key={color}
              type="button"
              className={`settings-color-option ${settings.accentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => settings.setAccentColor(color)}
              aria-label={`Select ${color} accent color`}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="settings-section">
        <h2><FileText size={20} /> Font Size</h2>
        <p className="settings-section-desc">Adjust the text size for better readability</p>

        <div className="settings-field">
          <div className="settings-select-wrapper">
            <FileText size={18} className="settings-input-icon" />
            <select
              value={settings.fontSize}
              onChange={(e) => settings.setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="settings-select"
            >
              <option value="small">Small</option>
              <option value="medium">Medium (Default)</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="settings-section">
        <h2><Eye size={20} /> Display Options</h2>
        <p className="settings-section-desc">Customize how content is displayed</p>

        <div className="settings-toggles">
          <ToggleItem
            label="Compact Mode"
            description="Show more content with reduced spacing"
            checked={settings.compactMode}
            onChange={settings.setCompactMode}
          />
          <ToggleItem
            label="Show Avatars"
            description="Display user avatars in thread lists"
            checked={settings.showAvatars}
            onChange={settings.setShowAvatars}
          />
        </div>

        <div className="settings-field" style={{ marginTop: '1rem' }}>
          <label htmlFor="postsPerPage">Posts Per Page</label>
          <div className="settings-select-wrapper">
            <FileText size={18} className="settings-input-icon" />
            <select
              id="postsPerPage"
              value={settings.postsPerPage}
              onChange={(e) => settings.setPostsPerPage(Number(e.target.value))}
              className="settings-select"
            >
              <option value={10}>10 posts</option>
              <option value={25}>25 posts</option>
              <option value={50}>50 posts</option>
            </select>
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="defaultSort">Default Sort Order</label>
          <div className="settings-select-wrapper">
            <FileText size={18} className="settings-input-icon" />
            <select
              id="defaultSort"
              value={settings.defaultSort}
              onChange={(e) => settings.setDefaultSort(e.target.value as 'newest' | 'oldest' | 'popular')}
              className="settings-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trading Tab
interface TradingTabProps {
  settings: SettingsState;
}

function TradingTab({ settings }: TradingTabProps) {
  return (
    <div className="settings-form">
      {/* Collection Settings */}
      <div className="settings-section">
        <h2><Heart size={20} /> Collection</h2>
        <p className="settings-section-desc">Manage your card collection visibility</p>

        <div className="settings-field">
          <label htmlFor="collectionVisibility">Collection Visibility</label>
          <div className="settings-select-wrapper">
            <Eye size={18} className="settings-input-icon" />
            <select
              id="collectionVisibility"
              value={settings.collectionVisibility}
              onChange={(e) => settings.setCollectionVisibility(e.target.value as 'public' | 'private')}
              className="settings-select"
            >
              <option value="public">Public - Anyone can view</option>
              <option value="private">Private - Only you can view</option>
            </select>
          </div>
        </div>

        <div className="settings-toggles">
          <ToggleItem
            label="Show Wishlist"
            description="Display your card wishlist on your profile"
            checked={settings.showWishlist}
            onChange={settings.setShowWishlist}
          />
        </div>
      </div>

      {/* Trade Settings */}
      <div className="settings-section">
        <h2><CreditCard size={20} /> Trading Preferences</h2>
        <p className="settings-section-desc">Set your trading availability and preferences</p>

        <div className="settings-field">
          <label htmlFor="tradeStatus">Trade Status</label>
          <div className="settings-select-wrapper">
            <CreditCard size={18} className="settings-input-icon" />
            <select
              id="tradeStatus"
              value={settings.tradeStatus}
              onChange={(e) => settings.setTradeStatus(e.target.value as 'active' | 'paused' | 'not-trading')}
              className="settings-select"
            >
              <option value="active">Actively Trading</option>
              <option value="paused">Paused</option>
              <option value="not-trading">Not Trading</option>
            </select>
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="tradeRegion">Preferred Trade Region</label>
          <div className="settings-select-wrapper">
            <Globe size={18} className="settings-input-icon" />
            <select
              id="tradeRegion"
              value={settings.tradeRegion}
              onChange={(e) => settings.setTradeRegion(e.target.value)}
              className="settings-select"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Worldwide">Worldwide</option>
            </select>
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="gradingPreference">Preferred Grading Service</label>
          <div className="settings-select-wrapper">
            <Shield size={18} className="settings-input-icon" />
            <select
              id="gradingPreference"
              value={settings.gradingPreference}
              onChange={(e) => settings.setGradingPreference(e.target.value as 'psa' | 'bgs' | 'cgc' | 'sgc' | 'raw' | 'any')}
              className="settings-select"
            >
              <option value="any">No Preference</option>
              <option value="psa">PSA</option>
              <option value="bgs">BGS (Beckett)</option>
              <option value="cgc">CGC</option>
              <option value="sgc">SGC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Component
interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleItem({ label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="settings-toggle-item">
      <div className="settings-toggle-info">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <button
        type="button"
        className={`settings-toggle ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="settings-toggle-slider" />
      </button>
    </div>
  );
}
