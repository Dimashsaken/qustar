import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration and client singleton
 * Connects to the QuStar bird database with authenticated access
 * Now supports private storage buckets with signed URL generation
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

/**
 * Singleton Supabase client instance
 * Configured for authenticated access to bird data and private storage
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No user authentication needed for bird data
    autoRefreshToken: false,
    detectSessionInUrl: false,
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