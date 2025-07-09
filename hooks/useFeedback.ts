import { supabase } from '@/lib/supabaseClient';
import type { CreateFeedbackData, Feedback, FeedbackSubmissionResult } from '@/types/feedback';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { Dimensions, Platform } from 'react-native';
import { useAuth } from './useAuth';

/**
 * Hook for managing feedback operations
 * @returns Object with feedback operations and state
 */
export const useFeedback = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Get device information for feedback context
   */
  const getDeviceInfo = () => {
    const { width, height } = Dimensions.get('screen');
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: Constants.expoConfig?.version || 'unknown',
      screenSize: { width, height },
      deviceBrand: Platform.OS === 'ios' ? 'Apple' : 'Android',
    };
  };

  /**
   * Submit new feedback
   */
  const submitFeedback = useMutation({
    mutationFn: async (feedbackData: CreateFeedbackData): Promise<FeedbackSubmissionResult> => {
      try {
        const deviceInfo = getDeviceInfo();
        
        const { data, error } = await supabase
          .from('feedback')
          .insert({
            ...feedbackData,
            user_id: user?.id || null,
            device_info: deviceInfo,
            app_version: Constants.expoConfig?.version || 'unknown',
          })
          .select()
          .single();

        if (error) {
          console.error('Error submitting feedback:', error);
          return {
            success: false,
            error: error.message,
          };
        }

        return {
          success: true,
          feedback: data,
        };
      } catch (error) {
        console.error('Error submitting feedback:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    onSuccess: () => {
      // Invalidate feedback queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  /**
   * Get user's feedback history
   */
  const getUserFeedback = useQuery({
    queryKey: ['feedback', 'user', user?.id],
    queryFn: async (): Promise<Feedback[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user feedback:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  /**
   * Get feedback by ID
   */
  const getFeedbackById = (id: string) => {
    return useQuery({
      queryKey: ['feedback', id],
      queryFn: async (): Promise<Feedback | null> => {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching feedback:', error);
          throw error;
        }

        return data;
      },
      enabled: !!id,
    });
  };

  return {
    submitFeedback,
    getUserFeedback,
    getFeedbackById,
    isSubmitting: submitFeedback.isPending,
    submitError: submitFeedback.error,
    submitSuccess: submitFeedback.isSuccess,
  };
}; 