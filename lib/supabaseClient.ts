import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration and client singleton
 * Connects to the QuStar bird database with authenticated access
 * Now supports user authentication and private storage buckets
 * Configured with AsyncStorage for proper session persistence in React Native
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

/**
 * Singleton Supabase client instance
 * Configured for user authentication and private storage access
 * Uses AsyncStorage for secure session persistence across app restarts
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for secure session persistence
    persistSession: true, // Enable session persistence for user auth
    autoRefreshToken: true, // Auto-refresh expired tokens
    detectSessionInUrl: true, // Detect session from URL (for email confirmations)
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

// Test the connection on startup
(async () => {
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
})(); 