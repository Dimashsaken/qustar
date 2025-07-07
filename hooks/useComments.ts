import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type {
    BirdComment,
    CommentWithBird,
    CreateCommentPayload,
    UpdateCommentPayload
} from '../types/comment';
import { useAuth } from './useAuth';

/**
 * Hook for fetching user's personal notes for a specific bird
 * Notes are private to each user (like favorites)
 * @param birdId - The ID of the bird to fetch notes for
 * @returns Object with user's notes data and loading state
 */
export const useComments = (birdId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-bird-notes', user?.id, birdId],
    queryFn: async (): Promise<BirdComment[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('bird_comments')
        .select('*')
        .eq('bird_id', birdId)
        .eq('user_id', user.id)  // Only fetch user's own notes
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!birdId && !!user
  });

  return {
    comments,
    isLoading,
    error,
    refetch,
    count: comments.length
  };
};

/**
 * Hook for adding a new personal note
 * @returns Mutation function for adding notes
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload): Promise<BirdComment> => {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('bird_comments')
        .insert([{
          user_id: user.id,
          bird_id: payload.bird_id,
          comment: payload.comment.trim()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch notes for this bird
      queryClient.invalidateQueries({ queryKey: ['user-bird-notes', user?.id, data.bird_id] });
    },
    onError: (error: Error) => {
      console.error('Error adding note:', error);
    }
  });
};

/**
 * Hook for updating an existing personal note
 * @returns Mutation function for updating notes
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      payload 
    }: { 
      commentId: string; 
      payload: UpdateCommentPayload 
    }): Promise<BirdComment> => {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('bird_comments')
        .update({ comment: payload.comment.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only update their own notes
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch notes for this bird
      queryClient.invalidateQueries({ queryKey: ['user-bird-notes', user?.id, data.bird_id] });
    },
    onError: (error: Error) => {
      console.error('Error updating note:', error);
    }
  });
};

/**
 * Hook for deleting a personal note
 * @returns Mutation function for deleting notes
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      birdId 
    }: { 
      commentId: string; 
      birdId: string 
    }): Promise<void> => {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const { error } = await supabase
        .from('bird_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own notes

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch notes for this bird
      queryClient.invalidateQueries({ queryKey: ['user-bird-notes', user?.id, variables.birdId] });
    },
    onError: (error: Error) => {
      console.error('Error deleting note:', error);
    }
  });
};

/**
 * Hook for getting user's notes across all birds with bird information
 * @returns User's notes data with bird details and loading state
 */
export const useUserComments = () => {
  const { user } = useAuth();

  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['all-user-bird-notes', user?.id],
    queryFn: async (): Promise<CommentWithBird[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('bird_comments')
        .select(`
          *,
          bird:bird_id (
            id,
            common_name_ru,
            common_name_en,
            scientific_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user
  });

  return {
    comments,
    isLoading,
    error,
    refetch,
    count: comments.length
  };
};