'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const initializationRef = useRef(false);

  const fetchUserProfile = useCallback(async (authUser: User) => {
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
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!profile) return null;

    return {
      ...profile,
      email: authUser.email || '',
    } as AuthUser;
  }, []);

  const refreshUser = useCallback(async () => {
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
  }, [fetchUserProfile]);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    let subscription: { unsubscribe: () => void } | null = null;
    let hydrationTimeout: NodeJS.Timeout | null = null;
    let isCleanedUp = false;

    // Force hydration after 2 seconds no matter what
    hydrationTimeout = setTimeout(() => {
      if (!isCleanedUp) {
        console.warn('Auth: Hydration timeout - forcing hydration');
        setIsLoading(false);
        setIsHydrated(true);
      }
    }, 2000);

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('Auth: Initializing...');
        const supabase = getSupabaseClient();

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        console.log('Auth: getUser result:', { authUser: authUser?.email, error: authError?.message });

        if (isCleanedUp) return;

        if (authUser) {
          const profile = await fetchUserProfile(authUser);
          console.log('Auth: Profile fetched:', profile?.username);
          if (!isCleanedUp) {
            setUser(profile);
            setSupabaseUser(authUser);
          }
        } else {
          console.log('Auth: No user found');
        }

        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (isCleanedUp) return;
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await fetchUserProfile(session.user);
              setUser(profile);
              setSupabaseUser(session.user);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSupabaseUser(null);
            } else if (event === 'USER_UPDATED' && session?.user) {
              const profile = await fetchUserProfile(session.user);
              setUser(profile);
              setSupabaseUser(session.user);
            }
          }
        );
        subscription = data.subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (!isCleanedUp) {
          if (hydrationTimeout) {
            clearTimeout(hydrationTimeout);
          }
          setIsLoading(false);
          setIsHydrated(true);
          console.log('Auth: Hydrated');
        }
      }
    };

    initializeAuth();

    return () => {
      isCleanedUp = true;
      if (hydrationTimeout) {
        clearTimeout(hydrationTimeout);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
