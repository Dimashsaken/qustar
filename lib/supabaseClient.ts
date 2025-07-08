import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * Supabase configuration and client singleton
 * Connects to the QuStar bird database with authenticated access
 * Now supports user authentication and private storage buckets
 * Configured with platform-specific storage for proper session persistence
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  // For deployment builds, provide more detailed error information
  if (process.env.NODE_ENV === 'production') {
    console.error('🔧 Set these environment variables in your deployment platform:');
    console.error('   - EXPO_PUBLIC_SUPABASE_URL');
    console.error('   - EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  throw new Error('Missing Supabase environment variables');
}

/**
 * Platform-specific storage implementation for web compatibility
 * Uses AsyncStorage for React Native, localStorage for web (client-side only)
 */
const createPlatformStorage = () => {
  if (Platform.OS === 'web') {
    // For web, create a localStorage wrapper that's SSR-safe
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // For React Native, use AsyncStorage
    return AsyncStorage;
  }
};

/**
 * Singleton Supabase client instance
 * Configured for user authentication and private storage access
 * Uses platform-specific storage for secure session persistence
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createPlatformStorage(),
    persistSession: true, // Enable session persistence for user auth
    autoRefreshToken: true, // Auto-refresh expired tokens
    detectSessionInUrl: Platform.OS === 'web', // Only detect session from URL on web
    flowType: 'pkce', // Use PKCE flow for better security
    storageKey: 'qustar-auth-token', // Custom storage key for this app
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Limit realtime events for performance
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'qustar-mobile/1.0.0',
    },
  },
});

// Types for better TypeScript support
export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    display_name?: string;
  };
};

export type AuthError = {
  message: string;
  status?: number;
};

export type AuthResponse = {
  user: AuthUser | null;
  error: AuthError | null;
};

/**
 * Test the connection - only run on client side to avoid SSR issues
 */
const testConnection = async () => {
  try {
    const { count, error } = await supabase
      .from('qustar-info')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log(`✅ Supabase connected. Found ${count} birds in database`);
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
  }
};

// Only run connection test on client side (not during static rendering)
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  testConnection();
} 