'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@ember/ui-components';

// Simplified user type for auth context
interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = createClient();
  const initializedRef = useRef(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };

    initAuth();
  }, [supabase]);

  // Listen for auth changes (separate effect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(mapSupabaseUser(session.user));
          // Only redirect if we're on the home page or auth pages
          if (pathname === '/' || pathname?.startsWith('/auth')) {
            router.push('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Just update user, don't redirect
          setUser(mapSupabaseUser(session.user));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router, pathname]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome to Ember!',
        description: 'Your account has been created. Check your email to verify.',
      });
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Check your email!',
        description: 'We sent you a magic link to sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send magic link',
        description: error.message || 'An error occurred.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    signInWithMagicLink,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}