/**
 * Audio Detections Hook
 * Manages fetching and subscribing to BirdNET detection results
 * Integrates with React Query for caching and real-time updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { BirdDetection, DetectionWithAudio } from '../types/audio';
import { useAuth } from './useAuth';
import { useConnectionHealth } from './useConnectionHealth';

/**
 * Grouped detections by audio recording
 */
export interface GroupedDetections {
  audioId: string;
  detections: DetectionWithAudio[];
  recordedAt: string;
}

/**
 * Fetch user's detection results with associated audio uploads
 * @param userId - User ID to filter detections
 * @returns Promise resolving to detections with audio data
 */
const fetchAudioDetections = async (userId: string): Promise<DetectionWithAudio[]> => {
  console.log('🔍 Fetching audio detections for user:', userId);
  
  // Fetch detections directly by user_id for better performance
  const { data: detections, error: detectionsError } = await supabase
    .from('detections')
    .select(`
      *,
      audio_uploads:audio_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (detectionsError) {
    console.error('❌ Error fetching detections:', detectionsError);
    throw new Error(`Failed to fetch detections: ${detectionsError.message}`);
  }

  console.log(`✅ Fetched ${detections?.length || 0} detections`);

  // Transform data structure for compatibility
  const detectionsWithAudio: DetectionWithAudio[] = (detections || []).map((detection: any) => ({
    detection: {
      id: detection.id,
      audio_id: detection.audio_id,
      species: detection.species, // Scientific name (existing column)
      confidence: detection.confidence,
      start_sec: detection.start_sec,
      end_sec: detection.end_sec,
      created_at: detection.created_at,
      // Optimized Russian language fields
      display_name: detection.display_name, // Russian name when available
      common_name: detection.common_name, // English fallback name
    },
    audioUpload: detection.audio_uploads,
  }));

  return detectionsWithAudio;
};

/**
 * Hook for managing audio detections
 * Provides real-time updates and caching for detection results
 * @returns Object with detection data, loading states, and utilities
 */
export const useAudioDetections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { health, recoverConnection, updateHealth } = useConnectionHealth();

  // Query for fetching detections with reasonable caching
  const {
    data: detections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audioDetections', user?.id],
    queryFn: () => fetchAudioDetections(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnMount: false, // Don't automatically refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Only refetch when network reconnects
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * Force immediate refetch of detections
   */
  const forceRefetch = useCallback(async () => {
    console.log('🔄 Force refetching detections...');
    await queryClient.invalidateQueries({ 
      queryKey: ['audioDetections', user?.id],
      refetchType: 'active' // Only refetch active queries
    });
  }, [queryClient, user?.id]);

  // Real-time subscription for new detections with robust error handling
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up enhanced real-time detection subscription for user:', user.id);

    // Create stable channel name for user
    const channelName = `detection-updates-${user.id}`;
    let channel: any = null;
    let isSubscribed = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const setupSubscription = () => {
      // Clean up existing channel if any
      if (channel) {
        supabase.removeChannel(channel);
      }

      channel = supabase
        .channel(channelName, {
          config: {
            presence: {
              key: user.id,
            },
            broadcast: {
              self: true,
            },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'detections',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload: any) => {
            console.log('🔔 New detection received:', payload.new);
            // Force immediate update
            await forceRefetch();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'audio_uploads',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload: any) => {
            console.log('🔔 Audio upload status updated:', payload.new);
            // Force immediate update when upload status changes
            await forceRefetch();
          }
        )
        .subscribe((status: any) => {
          console.log('🔔 Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time subscription active');
            isSubscribed = true;
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            updateHealth(true); // Update connection health
            
            // Clear any pending reconnect timer
            if (reconnectTimer) {
              clearTimeout(reconnectTimer);
              reconnectTimer = null;
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time subscription error');
            isSubscribed = false;
            updateHealth(false); // Update connection health
            
            // Try to recover connection first (non-blocking)
            recoverConnection().then((recovered) => {
              if (!recovered && reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
                console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
                
                reconnectTimer = setTimeout(() => {
                  reconnectAttempts++;
                  setupSubscription();
                }, delay);
              } else if (!recovered) {
                console.error('❌ Max reconnection attempts reached. Falling back to periodic polling.');
                // Fallback to periodic polling
                startPollingFallback();
              }
            }).catch((error) => {
              console.error('❌ Connection recovery failed:', error);
              startPollingFallback();
            });
          } else if (status === 'CLOSED') {
            console.log('🔔 Subscription closed');
            isSubscribed = false;
            updateHealth(false); // Update connection health
            
            // Only attempt reconnection if it wasn't a manual close and connection might be recoverable
            if (reconnectAttempts < maxReconnectAttempts && health.isConnected) {
              const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000);
              console.log(`🔄 Connection closed, attempting to reconnect in ${delay}ms`);
              
              reconnectTimer = setTimeout(() => {
                reconnectAttempts++;
                setupSubscription();
              }, delay);
            } else if (!health.isConnected) {
              console.log('🔄 Connection appears to be down, starting polling fallback');
              startPollingFallback();
            }
          }
        });
    };

    // Fallback polling mechanism
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    
    const startPollingFallback = () => {
      console.log('🔄 Starting polling fallback every 10 seconds');
      pollingInterval = setInterval(async () => {
        console.log('� Polling for new detections (fallback mode)');
        await forceRefetch();
      }, 10000); // Poll every 10 seconds
    };

    // Initialize subscription
    setupSubscription();

    // Cleanup function
    return () => {
      console.log('�🔔 Cleaning up detection subscription');
      
      // Clear timers
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      
      // Clean up channel
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, forceRefetch, health, recoverConnection, updateHealth]);

  // Note: Real-time subscription handles updates, no periodic polling needed

  /**
   * Group detections by audio recording ID
   * @returns Array of grouped detections sorted by recording time
   */
  const getGroupedDetections = useCallback((): GroupedDetections[] => {
    const groups = new Map<string, DetectionWithAudio[]>();
    
    // Group detections by audio_id
    detections.forEach((detection: DetectionWithAudio) => {
      const audioId = detection.detection.audio_id;
      if (!groups.has(audioId)) {
        groups.set(audioId, []);
      }
      groups.get(audioId)!.push(detection);
    });
    
    // Convert to array and sort by recording time (newest first)
    const groupedArray: GroupedDetections[] = Array.from(groups.entries()).map(([audioId, detections]: [string, DetectionWithAudio[]]) => ({
      audioId,
      detections,
      recordedAt: detections[0].audioUpload.recorded_at,
    }));
    
    // Sort groups by recording time (newest first)
    return groupedArray.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  }, [detections]);

  /**
   * Get detections for a specific audio upload
   * @param audioId - Audio upload ID
   * @returns Array of detections for the audio
   */
  const getDetectionsForAudio = useCallback((audioId: string): BirdDetection[] => {
    return detections
      .filter((item: DetectionWithAudio) => item.detection.audio_id === audioId)
      .map((item: DetectionWithAudio) => item.detection);
  }, [detections]);

  /**
   * Get the most recent detections (last 10)
   * @returns Array of recent detections
   */
  const getRecentDetections = useCallback((): DetectionWithAudio[] => {
    return detections.slice(0, 10);
  }, [detections]);

  /**
   * Get detections grouped by species
   * @returns Map of species name to detection count
   */
  const getSpeciesCounts = useCallback((): Map<string, number> => {
    const counts = new Map<string, number>();
    detections.forEach((item: DetectionWithAudio) => {
      const species = item.detection.species;
      counts.set(species, (counts.get(species) || 0) + 1);
    });
    return counts;
  }, [detections]);

  return {
    detections,
    isLoading,
    isError,
    error,
    refetch,
    forceRefetch,
    getGroupedDetections,
    getDetectionsForAudio,
    getRecentDetections,
    getSpeciesCounts,
  };
}; 