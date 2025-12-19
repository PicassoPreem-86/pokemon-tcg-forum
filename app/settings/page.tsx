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
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { updateProfile } from '@/lib/actions/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setSignature(user.signature || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        showSuccessToast('Profile Updated', 'Your changes have been saved');
        await refreshUser();
      }
    } catch (error) {
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
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <Link href={`/u/${user.username}`} className="settings-back">
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
          <h1>Account Settings</h1>
          <p>Manage your profile and preferences</p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="settings-form">
          {message && (
            <div className={`settings-message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="settings-section">
            <h2>Profile Picture</h2>
            <div className="settings-avatar-section">
              <div className="settings-avatar">
                <Image
                  src={user.avatar_url || '/images/avatars/default.png'}
                  alt={user.display_name || user.username}
                  width={100}
                  height={100}
                />
              </div>
              <div className="settings-avatar-info">
                <p>Your avatar is synced with your account provider (Google, etc.)</p>
                <button type="button" className="btn btn-secondary" disabled>
                  <Camera size={16} />
                  Change Avatar (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="settings-section">
            <h2>Profile Information</h2>

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
                <User size={18} className="settings-input-icon" />
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
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  rows={4}
                  disabled={isLoading}
                  className="settings-textarea"
                />
              </div>
              <span className="settings-field-hint">{bio.length}/500 characters</span>
            </div>

            <div className="settings-field">
              <label htmlFor="signature">Forum Signature</label>
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
              <span className="settings-field-hint">{signature.length}/200 characters</span>
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
      </div>
    </div>
  );
}
