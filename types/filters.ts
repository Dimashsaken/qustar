/**
 * Расширенные типы фильтрации для птиц Казахстана
 */

/**
 * Расширенные фильтры поиска птиц
 */
export interface BirdSearchFilters {
  family?: string;
  size?: string;
  status?: string;
  colors?: string[];
  habitat?: string;
  bodyType?: string[];
  sizeCategory?: SizeCategory;
}

/**
 * Категории размеров птиц по казахстанским эталонам
 */
export type SizeCategory = 'very-small' | 'small-medium' | 'large' | 'very-large';

/**
 * Опции фильтра местообитаний
 */
export interface HabitatOption {
  id: string;
  label: string;
  icon: string;
  image?: any;
}

/**
 * Опции фильтра цветов
 */
export interface ColorOption {
  id: string;
  label: string;
  color: string;
}

/**
 * Опции фильтра типов тела/силуэтов
 */
export interface BodyTypeOption {
  id: string;
  label: string;
  icon: string;
}

/**
 * Опции фильтра размеров с эталонами
 */
export interface SizeOption {
  id: SizeCategory;
  label: string;
  description: string;
  range: string;
  examples: string[];
}

/**
 * Состояние активных фильтров
 */
export interface ActiveFilters {
  habitats: string;
  colors: string[];
  bodyTypes: string[];
  sizeCategories: SizeCategory;
}

/**
 * Результат фильтрации
 */
export interface FilterResult {
  count: number;
  hasActiveFilters: boolean;
} 