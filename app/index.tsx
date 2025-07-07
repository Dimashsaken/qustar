import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Index page that handles initial navigation
 * Redirects to auth screen if not authenticated, or to main tabs if authenticated
 */
export default function IndexScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading screen while checking auth
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: Colors[colorScheme ?? 'light'].background 
    }}>
      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
    </View>
  );
} 