/**
 * Connection Health Monitor Hook
 * Monitors Supabase connection health and provides recovery mechanisms
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ConnectionHealth {
  isConnected: boolean;
  lastSuccessfulConnection: Date | null;
  failureCount: number;
  isRecovering: boolean;
}

/**
 * Hook to monitor Supabase connection health
 * Provides automatic recovery mechanisms for real-time subscriptions
 */
export const useConnectionHealth = () => {
  const [health, setHealth] = useState<ConnectionHealth>({
    isConnected: true,
    lastSuccessfulConnection: new Date(),
    failureCount: 0,
    isRecovering: false,
  });

  /**
   * Test connection to Supabase
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('qustar-info')
        .select('id')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is OK for connection test
        console.warn('🔍 Connection test failed:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('🔍 Connection test error:', err);
      return false;
    }
  }, []);

  /**
   * Update connection health status
   */
  const updateHealth = useCallback((connected: boolean) => {
    setHealth(prev => ({
      ...prev,
      isConnected: connected,
      lastSuccessfulConnection: connected ? new Date() : prev.lastSuccessfulConnection,
      failureCount: connected ? 0 : prev.failureCount + 1,
      isRecovering: !connected && prev.failureCount > 0,
    }));
  }, []);

  /**
   * Attempt to recover connection
   */
  const recoverConnection = useCallback(async (): Promise<boolean> => {
    console.log('🔄 Attempting connection recovery...');
    
    setHealth(prev => ({ ...prev, isRecovering: true }));
    
    const isConnected = await testConnection();
    updateHealth(isConnected);
    
    if (isConnected) {
      console.log('✅ Connection recovered successfully');
    } else {
      console.warn('❌ Connection recovery failed');
    }
    
    return isConnected;
  }, [testConnection, updateHealth]);

  /**
   * Periodic health check
   */
  useEffect(() => {
    const healthCheckInterval = setInterval(async () => {
      if (health.isConnected) {
        const isConnected = await testConnection();
        if (!isConnected) {
          console.warn('🔍 Connection health check failed');
          updateHealth(false);
        }
      } else if (health.failureCount > 0) {
        // Attempt recovery if connection is down
        await recoverConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [health.isConnected, health.failureCount, testConnection, updateHealth, recoverConnection]);

  /**
   * Monitor network state changes (if available)
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online - testing connection');
      recoverConnection();
    };

    const handleOffline = () => {
      console.log('🌐 Network offline');
      updateHealth(false);
    };

    // Check if we're in a web environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [recoverConnection, updateHealth]);

  return {
    health,
    testConnection,
    recoverConnection,
    updateHealth,
  };
};
