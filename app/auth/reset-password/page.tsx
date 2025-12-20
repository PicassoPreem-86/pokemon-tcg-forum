'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { updatePassword } from '@/lib/actions/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(password);

      if (result.error) {
        setError(result.error);
        showErrorToast('Password Reset Failed', result.error);
      } else {
        setSuccess(true);
        showSuccessToast('Password Updated', 'Your password has been reset successfully');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
      showErrorToast('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-logo">
            <Link href="/" className="flex items-center justify-center mb-4">
              <Image
                src="/images/tcg-gossip-logo.png"
                alt="TCG Gossip"
                width={200}
                height={65}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="auth-success">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Password Reset!</h1>
            <p className="text-dark-300 mb-6">
              Your password has been successfully updated. Redirecting you to login...
            </p>
            <Link href="/login" className="auth-submit inline-flex items-center justify-center">
              Go to Login
            </Link>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="pokeball-bg" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <Link href="/" className="flex items-center justify-center mb-4">
            <Image
              src="/images/tcg-gossip-logo.png"
              alt="TCG Gossip"
              width={200}
              height={65}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
          <h1>Set New Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">New Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock size={18} />
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="pokeball-bg" />
      </div>
    </div>
  );
}
