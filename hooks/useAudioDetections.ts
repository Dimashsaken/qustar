/**
 * Audio Detections Hook
 * Manages fetching and subscribing to BirdNET detection results
 * Integrates with React Query for caching and real-time updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { BirdDetection, DetectionWithAudio } from '../types/audio';
import { useAuth } from './useAuth';

/**
 * Fetch user's audio uploads with their detection results
 * @param userId - User ID to filter uploads
 * @returns Promise resolving to uploads with detections
 */
const fetchAudioDetections = async (userId: string): Promise<DetectionWithAudio[]> => {
  const { data: uploads, error: uploadsError } = await supabase
    .from('audio_uploads')
    .select(`
      *,
      detections:detections(*)
    `)
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  if (uploadsError) {
    throw new Error(`Failed to fetch audio uploads: ${uploadsError.message}`);
  }

  // Flatten the data structure for easier consumption
  const detectionsWithAudio: DetectionWithAudio[] = [];
  
  uploads.forEach((upload) => {
    if (upload.detections && upload.detections.length > 0) {
      upload.detections.forEach((detection: BirdDetection) => {
        detectionsWithAudio.push({
          detection,
          audioUpload: upload,
        });
      });
    }
  });

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

  // Query for fetching detections
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Real-time subscription for new detections
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up real-time detection subscription');

    // Subscribe to new detections for user's audio uploads
    const channel = supabase
      .channel('detection-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detections',
        },
        async (payload) => {
          console.log('🔔 New detection received:', payload.new);
          
          // Verify this detection belongs to the current user
          const { data: audioUpload } = await supabase
            .from('audio_uploads')
            .select('user_id')
            .eq('id', (payload.new as BirdDetection).audio_id)
            .single();

          if (audioUpload?.user_id === user.id) {
            // Invalidate and refetch detections
            queryClient.invalidateQueries({ queryKey: ['audioDetections', user.id] });
          }
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
        (payload) => {
          console.log('🔔 Audio upload status updated:', payload.new);
          // Refetch when upload status changes (e.g., processing -> completed)
          queryClient.invalidateQueries({ queryKey: ['audioDetections', user.id] });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log('🔔 Cleaning up detection subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  /**
   * Get detections for a specific audio upload
   * @param audioId - Audio upload ID
   * @returns Array of detections for the audio
   */
  const getDetectionsForAudio = (audioId: string): BirdDetection[] => {
    return detections
      .filter((item) => item.detection.audio_id === audioId)
      .map((item) => item.detection);
  };

  /**
   * Get the most recent detections (last 10)
   * @returns Array of recent detections
   */
  const getRecentDetections = (): DetectionWithAudio[] => {
    return detections.slice(0, 10);
  };

  /**
   * Get detections grouped by species
   * @returns Map of species name to detection count
   */
  const getSpeciesCounts = (): Map<string, number> => {
    const counts = new Map<string, number>();
    detections.forEach((item) => {
      const species = item.detection.species;
      counts.set(species, (counts.get(species) || 0) + 1);
    });
    return counts;
  };

  return {
    detections,
    isLoading,
    isError,
    error,
    refetch,
    getDetectionsForAudio,
    getRecentDetections,
    getSpeciesCounts,
  };
}; 