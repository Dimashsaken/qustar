import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { SIZE_RANGES } from '../constants/FilterOptions';
import { supabase } from '../lib/supabaseClient';
import type { BirdListItem } from '../types/bird';
import type { BirdSearchFilters } from '../types/filters';

/**
 * Нормализация цветов для поиска (устранение опечаток)
 */
const normalizeColor = (color: string): string => {
  const normalized = color.toLowerCase().trim();
  if (normalized === 'bkack') return 'black';
  if (normalized === 'rgreen') return 'green';
  return normalized;
};

/**
 * Фильтрация по цветам в строке с запятыми
 */
const matchesColors = (birdColors: string | null, filterColors: string[]): boolean => {
  if (!birdColors || filterColors.length === 0) return true;
  
  const birdColorList = birdColors
    .split(',')
    .map(c => normalizeColor(c))
    .filter(c => c.length > 0);
    
  return filterColors.some(filterColor => 
    birdColorList.includes(normalizeColor(filterColor))
  );
};

/**
 * Фильтрация по местообитаниям в строке с запятыми
 */
const matchesHabitats = (birdHabitat: string | null, filterHabitats: string[]): boolean => {
  if (!birdHabitat || filterHabitats.length === 0) return true;
  
  const birdHabitatList = birdHabitat
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(h => h.length > 0);
    
  return filterHabitats.some(filterHabitat => 
    birdHabitatList.includes(filterHabitat.toLowerCase())
  );
};

/**
 * Получение птиц с расширенной фильтрацией
 */
const fetchFilteredBirds = async (filters?: BirdSearchFilters): Promise<BirdListItem[]> => {
  // Базовый запрос
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
      status_kz,
      habitat,
      body_type,
      length_cm_min,
      length_cm_max
    `);

  // Применяем базовые фильтры
  if (filters?.family) {
    query = query.ilike('family', `%${filters.family}%`);
  }
  if (filters?.status) {
    query = query.ilike('status_kz', `%${filters.status}%`);
  }

  // Фильтрация по типу тела
  if (filters?.bodyType && filters.bodyType.length > 0) {
    query = query.in('body_type', filters.bodyType);
  }

  const { data, error } = await query.order('common_name_ru');

  if (error) {
    console.error('❌ fetchFilteredBirds: Ошибка Supabase:', error);
    throw new Error(`Не удалось получить птиц: ${error.message}`);
  }

  if (!data) return [];

  // Клиентская фильтрация для сложных случаев
  let filteredData = data;

  // Фильтрация по цветам
  if (filters?.colors && filters.colors.length > 0) {
    filteredData = filteredData.filter(bird => 
      matchesColors(bird.primary_colors, filters.colors!)
    );
  }

  // Фильтрация по местообитаниям
  if (filters?.habitat && filters.habitat.length > 0) {
    filteredData = filteredData.filter(bird => 
      matchesHabitats(bird.habitat, filters.habitat!)
    );
  }

  // Фильтрация по размерам
  if (filters?.sizeCategory && filters.sizeCategory.length > 0) {
    filteredData = filteredData.filter(bird => {
      if (!bird.length_cm_min || !bird.length_cm_max) return false;
      
      const avgLength = (bird.length_cm_min + bird.length_cm_max) / 2;
      
      return filters.sizeCategory!.some(category => {
        const range = SIZE_RANGES[category];
        return avgLength >= range.min && avgLength <= range.max;
      });
    });
  }

  return filteredData;
};

/**
 * React Query хук для получения отфильтрованных птиц
 */
export const useFilteredBirds = (
  filters?: BirdSearchFilters
): UseQueryResult<BirdListItem[], Error> => {
  return useQuery({
    queryKey: ['filtered-birds', filters],
    queryFn: () => fetchFilteredBirds(filters),
    staleTime: 1000 * 60 * 60, // 1 час кеша
    gcTime: 1000 * 60 * 60 * 2, // 2 часа garbage collection
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 