import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { batchGenerateBirdImageUrls, generateBirdImageUrls } from '../lib/imageUtils';
import { supabase } from '../lib/supabaseClient';
import type { Bird, BirdListItem, BirdSearchFilters } from '../types/bird';

/**
 * Fetches all birds from Supabase with optional filtering
 * @param filters - Optional search and filter criteria
 * @returns Promise<BirdListItem[]> - Array of bird data for list display
 */
const fetchBirds = async (filters?: BirdSearchFilters): Promise<BirdListItem[]> => {
  // Build query according to Supabase documentation
  let query = supabase
    .from('qustar-info')
    .select(`
      id,
      scientific_name,
      common_name_en,
      common_name_kz,
      common_name_ru,
      family,
      size,
      primary_colors,
      status_kz
    `);

  // Apply filters if provided
  if (filters?.family) {
    query = query.ilike('family', `%${filters.family}%`);
  }
  if (filters?.size) {
    query = query.ilike('size', `%${filters.size}%`);
  }
  if (filters?.status) {
    query = query.ilike('status_kz', `%${filters.status}%`);
  }

  const { data, error } = await query.order('common_name_en');

  if (error) {
    console.error('❌ fetchBirds: Supabase error:', error);
    throw new Error(`Failed to fetch birds: ${error.message}`);
  }

  return data || [];
};

/**
 * React Query hook for fetching all birds with caching
 * @param filters - Optional search and filter criteria
 * @returns UseQueryResult with bird data, loading state, and error handling
 */
export const useBirds = (filters?: BirdSearchFilters): UseQueryResult<BirdListItem[], Error> => {
  return useQuery({
    queryKey: ['birds', filters],
    queryFn: () => fetchBirds(filters),
    staleTime: 1000 * 60 * 60, // 1 hour cache as per requirements
    gcTime: 1000 * 60 * 60 * 2, // 2 hours garbage collection
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Fetches a single bird by ID for detail view
 * @param id - Bird ID
 * @returns Promise<Bird | null> - Full bird data or null if not found
 */
const fetchBirdById = async (id: string): Promise<Bird | null> => {
  const { data, error } = await supabase
    .from('qustar-info')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Bird not found
    }
    throw new Error(`Failed to fetch bird: ${error.message}`);
  }

  return data;
};

/**
 * React Query hook for fetching a single bird by ID
 * @param id - Bird ID
 * @returns UseQueryResult with single bird data
 */
export const useBird = (id: string): UseQueryResult<Bird | null, Error> => {
  return useQuery({
    queryKey: ['bird', id],
    queryFn: () => fetchBirdById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 2, // 2 hours garbage collection
  });
};

/**
 * React Query hook for caching bird image URLs
 * @param birdId - Bird ID
 * @param scientificName - Scientific name for URL generation
 * @returns UseQueryResult with cached image URLs
 */
export const useBirdImageUrls = (
  birdId: string, 
  scientificName?: string | null
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['bird-image-urls', birdId, scientificName],
    queryFn: () => generateBirdImageUrls(birdId, scientificName),
    enabled: !!birdId,
    staleTime: 45 * 60 * 1000, // 45 minutes (5min buffer before signed URL expiry)
    gcTime: 55 * 60 * 1000, // 55 minutes garbage collection
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * React Query hook for batch caching multiple bird image URLs
 * @param birds - Array of birds to get URLs for
 * @returns UseQueryResult with map of bird IDs to image URLs
 */
export const useBatchBirdImageUrls = (
  birds: Array<{ id: string; scientific_name?: string | null }>
): UseQueryResult<Map<string, string[]>, Error> => {
  return useQuery({
    queryKey: ['batch-bird-image-urls', birds.map(b => b.id).sort()],
    queryFn: () => batchGenerateBirdImageUrls(birds),
    enabled: birds.length > 0,
    staleTime: 45 * 60 * 1000,
    gcTime: 55 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}; 