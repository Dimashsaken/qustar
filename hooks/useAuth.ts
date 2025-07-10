import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { AuthError, AuthResponse, AuthUser, supabase } from '../lib/supabaseClient';

/**
 * Authentication hook for managing user auth state and operations
 * Provides sign in, sign up, sign out, and session management
 * @returns Object with auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          console.log('✅ Session found - user should remain logged in');
        } else {
          console.log('ℹ️ No existing session found');
        }
        
        setSession(session);
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        } : null);
      } catch (err) {
        console.error('❌ Error checking session:', err);
        setError({ message: (err as Error).message });
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        } : null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setError(null);
        } else if (event === 'SIGNED_IN') {
          console.log('👤 User signed in');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed - session maintained');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param fullName - User's full name (optional)
   * @returns Promise<AuthResponse>
   */
  const signUp = async (
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            display_name: fullName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      return { user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      } : null, error: null };
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise<AuthResponse>
   */
  const signIn = async (
    email: string, 
    password: string
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      } : null, error: null };
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   * @returns Promise<AuthError | null>
   */
  const signOut = async (): Promise<AuthError | null> => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return null;
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return authError;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request password reset OTP code via email
   * @param email - User's email address
   * @returns Promise<AuthError | null>
   */
  const resetPassword = async (email: string): Promise<AuthError | null> => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // Don't send link, only OTP
      });
      if (error) throw error;
      return null;
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return authError;
    }
  };

  /**
   * Verify OTP code for password reset
   * @param email - User's email address
   * @param token - OTP token
   * @returns Promise<AuthResponse>
   */
  const verifyPasswordResetOtp = async (
    email: string,
    token: string
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });

      if (error) throw error;

      return { user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      } : null, error: null };
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update password after OTP verification
   * @param newPassword - New password
   * @returns Promise<AuthError | null>
   */
  const updatePasswordAfterReset = async (newPassword: string): Promise<AuthError | null> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return null;
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return authError;
    }
  };

  /**
   * Verify OTP code for email confirmation
   * @param email - User's email address
   * @param token - OTP token
   * @returns Promise<AuthResponse>
   */
  const verifyOtp = async (
    email: string,
    token: string
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) throw error;

      return { user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      } : null, error: null };
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP code via email
   * @param email - User's email address
   * @returns Promise<AuthError | null>
   */
  const resendOtp = async (email: string): Promise<AuthError | null> => {
    try {
      setError(null);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      return null;
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return authError;
    }
  };

  /**
   * Change password for authenticated user
   * @param newPassword - New password
   * @returns Promise<AuthError | null>
   */
  const changePassword = async (newPassword: string): Promise<AuthError | null> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return null;
    } catch (err) {
      const authError = { message: (err as Error).message };
      setError(authError);
      return authError;
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyPasswordResetOtp,
    updatePasswordAfterReset,
    changePassword,
    verifyOtp,
    resendOtp,
    isAuthenticated: !!user,
  };
}; 