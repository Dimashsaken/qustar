import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration and client singleton
 * Connects to the QuStar bird database with read-only access
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

/**
 * Singleton Supabase client instance
 * Configured for read-only access to bird data
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No user authentication needed
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Limit realtime events for performance
    },
  },
}); 