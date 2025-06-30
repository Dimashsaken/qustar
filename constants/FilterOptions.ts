import type {
  BodyTypeOption,
  ColorOption,
  HabitatOption,
  SizeOption
} from '../types/filters';

/**
 * Опции фильтра местообитаний на основе данных из базы
 */
export const HABITAT_OPTIONS: HabitatOption[] = [
  { 
    id: 'forest', 
    label: 'Лес', 
    icon: 'tree.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 05_34_18 PM.png')
  },
  { 
    id: 'steppe', 
    label: 'Степь', 
    icon: 'leaf.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 05_13_28 PM.png')
  },
  { 
    id: 'desert', 
    label: 'Пустыня', 
    icon: 'sun.max.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 04_56_37 PM.png')
  },
  { 
    id: 'mountain', 
    label: 'Горы', 
    icon: 'mountain.2.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 05_26_46 PM.png')
  },
  { 
    id: 'wetlands', 
    label: 'Водно-болотные угодья', 
    icon: 'drop.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 05_29_57 PM.png')
  },
  { 
    id: 'settlement', 
    label: 'Населенные пункты', 
    icon: 'building.2.fill',
    image: require('../assets/images/ChatGPT Image Jun 30, 2025, 05_06_57 PM.png')
  },
];

/**
 * Опции фильтра цветов на основе данных из базы
 */
export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'black', label: 'Черный', color: '#000000' },
  { id: 'white', label: 'Белый', color: '#FFFFFF' },
  { id: 'grey', label: 'Серый', color: '#808080' },
  { id: 'red', label: 'Красный', color: '#DC2626' },
  { id: 'blue', label: 'Синий', color: '#2563EB' },
  { id: 'yellow', label: 'Желтый', color: '#EAB308' },
  { id: 'green', label: 'Зеленый', color: '#16A34A' },
];

/**
 * Опции фильтра типов тела/силуэтов
 */
export const BODY_TYPE_OPTIONS: BodyTypeOption[] = [
  { id: 'raptor', label: 'Хищные птицы', icon: 'bird' },
  { id: 'duck', label: 'Утки', icon: 'bird.fill' },
  { id: 'goose', label: 'Гуси', icon: 'bird.fill' },
  { id: 'galliform', label: 'Курообразные', icon: 'bird.fill' },
  { id: 'wader', label: 'Кулики', icon: 'bird' },
];

/**
 * Опции фильтра размеров с казахстанскими эталонами
 */
export const SIZE_OPTIONS: SizeOption[] = [
  {
    id: 'very-small',
    label: 'Очень мелкие',
    description: 'Размером с воробья',
    range: '≤ 19 см',
    examples: ['Домовый воробей 14-18 см', 'Большая синица 13-17 см']
  },
  {
    id: 'small-medium', 
    label: 'Малые/средние',
    description: 'От скворца до вороны',
    range: '20-45 см',
    examples: ['Обыкн. скворец 20-25 см', 'Сизый голубь 29-36 см']
  },
  {
    id: 'large',
    label: 'Крупные', 
    description: 'Больше вороны до гуся',
    range: '46-70 см',
    examples: ['Чёрная ворона 48-52 см', 'Курганник ≈ 50-60 см']
  },
  {
    id: 'very-large',
    label: 'Очень крупные',
    description: 'С гуся и крупнее', 
    range: '≥ 70 см',
    examples: ['Серый гусь 70-90 см', 'Серая цапля ≈ 84-102 см']
  }
];

/**
 * Размерные диапазоны для фильтрации по измерениям
 */
export const SIZE_RANGES = {
  'very-small': { min: 0, max: 19 },
  'small-medium': { min: 20, max: 45 },
  'large': { min: 46, max: 70 },
  'very-large': { min: 71, max: 999 }
} as const; 