'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { resetPassword } from '@/lib/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
            <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-dark-300 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-dark-400 text-sm mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Link href="/login" className="auth-submit inline-flex items-center justify-center">
              <ArrowLeft size={18} />
              Back to Login
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
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@pokemon.com"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={18} />
                Send Reset Link
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
