'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Profile, UserBadge } from '@/lib/supabase/database.types';

export type AuthUser = Profile & {
  email: string;
  badges: UserBadge[];
};

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    try {
      const supabase = getSupabaseClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          badges:user_badges(*)
        `)
        .eq('id', authUser.id)
        .single() as { data: (Profile & { badges: UserBadge[] }) | null; error: Error | null };

      if (error) {
        console.error('[useAuth] Error fetching user profile:', error);
        return null;
      }

      if (!profile) return null;

      return {
        ...profile,
        email: authUser.email || '',
      } as AuthUser;
    } catch (err) {
      console.error('[useAuth] Exception fetching user profile:', err);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const profile = await fetchUserProfile(authUser);
        setUser(profile);
        setSupabaseUser(authUser);
      } else {
        setUser(null);
        setSupabaseUser(null);
      }
    } catch (err) {
      console.error('[useAuth] Error refreshing user:', err);
    }
  }, [fetchUserProfile]);

  // Hydrate immediately on client mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize auth
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const supabase = getSupabaseClient();

        // Debug: Check session first
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('[useAuth] Session check:', {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id || null,
          email: sessionData.session?.user?.email || null,
        });

        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        console.log('[useAuth] getUser result:', {
          hasUser: !!authUser,
          email: authUser?.email || null,
          error: userError?.message || null,
        });

        if (!mounted) return;

        if (authUser) {
          const profile = await fetchUserProfile(authUser);
          console.log('[useAuth] Profile fetched:', {
            hasProfile: !!profile,
            username: profile?.username || null,
          });
          if (mounted) {
            setUser(profile);
            setSupabaseUser(authUser);
          }
        }

        // Set up auth state listener
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          console.log('[useAuth] Auth state changed:', event, session?.user?.email || null);

          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(profile);
              setSupabaseUser(session.user);
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setUser(null);
              setSupabaseUser(null);
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            const profile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(profile);
              setSupabaseUser(session.user);
            }
          }
        });

        subscription = data.subscription;
      } catch (error) {
        console.error('[useAuth] Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const value = {
    user,
    supabaseUser,
    isAuthenticated: !!user,
    isLoading,
    isHydrated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper functions for role checks
export function isUserAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export function isUserModerator(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'moderator';
}

// Compatibility export for existing code
export { AuthProvider as default };
