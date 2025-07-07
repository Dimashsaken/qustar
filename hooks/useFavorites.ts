import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BirdListItem } from '../types/bird';
import { useAuth } from './useAuth';

/**
 * Favorite bird record from database
 */
interface FavoriteRecord {
  id: string;
  user_id: string;
  bird_id: string;
  created_at: string;
  updated_at: string;
  'qustar-info': BirdListItem | null;
}

/**
 * Hook for managing user's favorite birds with Supabase auth
 * @returns Object with favorites data and management functions
 */
export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Fetch user's favorite birds from database
   */
  const fetchFavorites = async (): Promise<BirdListItem[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        bird_id,
        created_at,
        qustar-info!inner (
          id,
          scientific_name,
          common_name_en,
          common_name_kz,
          common_name_ru,
          family,
          size,
          primary_colors,
          status_kz
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      throw new Error(error.message);
    }

    // Transform data to BirdListItem format
    const favoriteRecords = data as unknown as FavoriteRecord[];
    return favoriteRecords
      .map(record => record['qustar-info'])
      .filter((bird): bird is BirdListItem => bird !== null);
  };

  /**
   * Query for user's favorites
   */
  const {
    data: favorites = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  /**
   * Check if bird is in favorites
   */
  const isFavorite = useCallback((birdId: string): boolean => {
    return favorites.some(bird => bird.id === birdId);
  }, [favorites]);

  /**
   * Add bird to favorites mutation
   */
  const addFavoriteMutation = useMutation({
    mutationFn: async (bird: BirdListItem) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          bird_id: bird.id
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Птица уже добавлена в избранное');
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  /**
   * Remove bird from favorites mutation
   */
  const removeFavoriteMutation = useMutation({
    mutationFn: async (birdId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('bird_id', birdId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  /**
   * Add bird to favorites
   */
  const addFavorite = useCallback(async (bird: BirdListItem) => {
    if (!isAuthenticated) {
      throw new Error('Необходимо войти в систему для добавления в избранное');
    }

    try {
      await addFavoriteMutation.mutateAsync(bird);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [isAuthenticated, addFavoriteMutation]);

  /**
   * Remove bird from favorites
   */
  const removeFavorite = useCallback(async (birdId: string) => {
    if (!isAuthenticated) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      await removeFavoriteMutation.mutateAsync(birdId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [isAuthenticated, removeFavoriteMutation]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(async (bird: BirdListItem) => {
    if (!isAuthenticated) {
      throw new Error('Необходимо войти в систему для использования избранного');
    }

    try {
      if (isFavorite(bird.id)) {
        await removeFavorite(bird.id);
      } else {
        await addFavorite(bird);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [isAuthenticated, isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isLoading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch,
    count: favorites.length,
    isAuthenticated,
    // Mutation states for UI feedback
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
}; 