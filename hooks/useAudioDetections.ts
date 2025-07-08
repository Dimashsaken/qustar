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
      species: detection.species,
      confidence: detection.confidence,
      start_sec: detection.start_sec,
      end_sec: detection.end_sec,
      created_at: detection.created_at,
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

  // Query for fetching detections with aggressive refetch strategies
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
    staleTime: 0, // Always consider data stale for immediate updates
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
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
      refetchType: 'all' // Force refetch even if data is fresh
    });
    await refetch();
  }, [queryClient, user?.id, refetch]);

  // Real-time subscription for new detections
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up enhanced real-time detection subscription for user:', user.id);

    // Create stable channel name for user
    const channelName = `detection-updates-${user.id}`;
    
    const channel = supabase
      .channel(channelName)
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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
        }
      });

    // Cleanup subscription
    return () => {
      console.log('🔔 Cleaning up detection subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, forceRefetch]);

  // Additional effect to periodically check for new detections (fallback)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log('🔄 Periodic detection refresh');
      refetch();
    }, 30000); // Check every 30 seconds as fallback

    return () => clearInterval(interval);
  }, [user?.id, refetch]);

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