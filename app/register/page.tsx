'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { signUp, signInWithGoogle } from '@/lib/actions/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Clear errors on input change
  useEffect(() => {
    if (error) {
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally exclude 'error' to avoid infinite loop
  }, [username, email, password, confirmPassword]);

  // Password strength
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please meet at least 3 requirements.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        email,
        password,
        username,
        displayName: username,
      });

      if (result.error) {
        setError(result.error);
        showErrorToast('Registration failed', result.error);
      } else {
        showSuccessToast('Welcome to TCG Gossip!', 'Your account has been created successfully. Please check your email to verify your account.');
        router.push('/login');
      }
    } catch {
      setError('An unexpected error occurred');
      showErrorToast('Registration failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
        showErrorToast('Sign up failed', result.error);
        setIsLoading(false);
      }
      // If successful, the redirect will happen automatically
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-register">
        {/* Logo Section */}
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
          <h1>Join the Community!</h1>
          <p>Create your TCG Gossip account</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="Choose a username"
                autoComplete="username"
                maxLength={20}
                disabled={isLoading}
              />
              {username.length >= 3 && (
                <span className="input-valid-icon">
                  <Check size={16} />
                </span>
              )}
            </div>
            <span className="auth-hint">3-20 characters. Letters, numbers, and underscores only.</span>
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
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

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
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

            {/* Password Strength */}
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className={`strength-fill strength-${passwordStrength}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <div className="strength-checks">
                  <span className={passwordChecks.length ? 'valid' : ''}>
                    {passwordChecks.length ? <Check size={12} /> : <X size={12} />}
                    8+ characters
                  </span>
                  <span className={passwordChecks.uppercase ? 'valid' : ''}>
                    {passwordChecks.uppercase ? <Check size={12} /> : <X size={12} />}
                    Uppercase
                  </span>
                  <span className={passwordChecks.lowercase ? 'valid' : ''}>
                    {passwordChecks.lowercase ? <Check size={12} /> : <X size={12} />}
                    Lowercase
                  </span>
                  <span className={passwordChecks.number ? 'valid' : ''}>
                    {passwordChecks.number ? <Check size={12} /> : <X size={12} />}
                    Number
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              {confirmPassword && (
                <span className={`password-match ${password === confirmPassword ? 'match' : 'no-match'}`}>
                  {password === confirmPassword ? <Check size={18} /> : <X size={18} />}
                </span>
              )}
            </div>
          </div>

          <div className="auth-terms">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span className="checkmark" />
              I agree to the{' '}
              <Link href="/terms">Terms of Service</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                Creating account...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or sign up with</span>
        </div>

        {/* Social Sign Up */}
        <div className="auth-social">
          <button
            type="button"
            className="auth-social-btn google"
            disabled={isLoading}
            onClick={handleGoogleSignUp}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        {/* Login Link */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="auth-decoration">
        <div className="pokeball-bg" />
      </div>
    </div>
  );
}
