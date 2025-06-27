/**
 * Core bird data interface matching Supabase 'qustar-info' table
 */
export interface Bird {
  id: string;
  scientific_name: string | null;
  common_name_en: string | null;
  common_name_kz: string | null;
  common_name_ru: string | null;
  alternative_names: string | null;
  family: string | null;
  order: string | null;
  subspecies_in_kz: string | null;
  size: string | null;
  length_cm_min: number | null;
  length_cm_max: number | null;
  wingspan_cm_min: number | null;
  wingspan_cm_max: number | null;
  weight_g_min: number | null;
  weight_g_max: number | null;
  primary_colors: string | null;
  body_type: string | null;
  beak_type: string | null;
  status_kz: string | null;
  habitat: string | null;
  notes: string | null;
}

/**
 * Simplified bird interface for list displays
 */
export interface BirdListItem {
  id: string;
  scientific_name: string | null;
  common_name_en: string | null;
  common_name_kz: string | null;
  common_name_ru: string | null;
  family: string | null;
  size: string | null;
  primary_colors: string | null;
  status_kz: string | null;
}

/**
 * Search filter options for bird queries
 */
export interface BirdSearchFilters {
  family?: string;
  size?: string;
  status?: string;
  colors?: string[];
}

/**
 * Bird search result with ranking for fuzzy search
 */
export interface BirdSearchResult {
  bird: BirdListItem;
  score?: number; // For fuse.js search results
}

/**
 * Supported language codes for internationalization
 */
export type LanguageCode = 'en' | 'kz' | 'ru';

/**
 * API response wrapper for bird queries
 */
export interface BirdQueryResponse {
  data: Bird[] | null;
  error: string | null;
  loading: boolean;
} 