/**
 * Achievement System Hook
 * Calculates user achievements and ranks based on audio detection data
 */

import { useMemo } from 'react';
import type {
    Achievement,
    RecorderRank,
    RecorderRankInfo,
    UserAchievements
} from '../types/achievement';
import type { DetectionWithAudio } from '../types/audio';

/**
 * Recorder rank thresholds and configurations
 */
const RANK_CONFIG: Record<RecorderRank, {
  threshold: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}> = {
  beginner: {
    threshold: 0,
    title: 'Начинающий',
    description: 'Делаете первые шаги в записи птиц',
    icon: 'musical-note',
    color: '#8E8E93',
  },
  junior: {
    threshold: 5,
    title: 'Юниор',
    description: 'Уже умеете находить птиц с хорошей точностью',
    icon: 'musical-notes',
    color: '#007AFF',
  },
  intermediate: {
    threshold: 15,
    title: 'Знаток',
    description: 'Опытный исследователь птиц Казахстана',
    icon: 'radio',
    color: '#30D158',
  },
  advanced: {
    threshold: 30,
    title: 'Эксперт',
    description: 'Мастер качественных записей птиц',
    icon: 'podium',
    color: '#FF9500',
  },
  expert: {
    threshold: 50,
    title: 'Профи',
    description: 'Профессиональный орнитолог-любитель',
    icon: 'trophy',
    color: '#FF3B30',
  },
  master: {
    threshold: 100,
    title: 'Мастер',
    description: 'Легенда среди записывающих птиц',
    icon: 'star',
    color: '#FFD60A',
  },
};

/**
 * Achievement definitions
 */
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_quality_recording',
    type: 'recorder_rank',
    title: 'Первая качественная запись',
    description: 'Сделайте первую запись с точностью >80%',
    icon: 'star-outline',
    color: '#007AFF',
    requirement: 1,
  },
  {
    id: 'species_collector_5',
    type: 'species_explorer',
    title: 'Коллекционер видов',
    description: 'Найдите 5 разных видов птиц',
    icon: 'library-outline',
    color: '#30D158',
    requirement: 5,
  },
  {
    id: 'species_collector_15',
    type: 'species_explorer',
    title: 'Знаток видов',
    description: 'Найдите 15 разных видов птиц',
    icon: 'library',
    color: '#30D158',
    requirement: 15,
  },
  {
    id: 'quality_master',
    type: 'quality_detective',
    title: 'Мастер качества',
    description: 'Достигните средней точности 85%',
    icon: 'checkmark-circle',
    color: '#FF9500',
    requirement: 85,
  },
  {
    id: 'consistent_birder_7',
    type: 'consistent_birder',
    title: 'Постоянный исследователь',
    description: 'Записывайте птиц 7 дней подряд',
    icon: 'calendar',
    color: '#8E8E93',
    requirement: 7,
  },
  {
    id: 'perfectionist',
    type: 'quality_detective',
    title: 'Перфекционист',
    description: 'Сделайте запись с точностью 95%+',
    icon: 'diamond',
    color: '#FFD60A',
    requirement: 95,
  },
];

/**
 * Calculate user's recorder rank based on high-confidence detections
 */
const calculateRecorderRank = (highConfidenceCount: number): RecorderRankInfo => {
  const ranks: RecorderRank[] = ['master', 'expert', 'advanced', 'intermediate', 'junior', 'beginner'];
  
  let currentRank: RecorderRank = 'beginner';
  for (const rank of ranks) {
    if (highConfidenceCount >= RANK_CONFIG[rank].threshold) {
      currentRank = rank;
      break;
    }
  }
  
  const config = RANK_CONFIG[currentRank];
  
  // Find next rank threshold
  const currentIndex = ranks.indexOf(currentRank);
  const nextRank = currentIndex > 0 ? ranks[currentIndex - 1] : null;
  const nextThreshold = nextRank ? RANK_CONFIG[nextRank].threshold : null;
  
  // Calculate progress percentage
  const progressPercentage = nextThreshold 
    ? Math.min(100, (highConfidenceCount / nextThreshold) * 100)
    : 100;
  
  return {
    rank: currentRank,
    title: config.title,
    description: config.description,
    icon: config.icon,
    color: config.color,
    currentProgress: highConfidenceCount,
    nextRankThreshold: nextThreshold,
    progressPercentage,
  };
};

/**
 * Hook for calculating and managing user achievements
 * @param detections - User's detection data
 * @returns User achievements and statistics
 */
export const useAchievements = (detections: DetectionWithAudio[]): UserAchievements => {
  return useMemo(() => {
    // Basic stats calculation implementation here
    // This will be expanded in the next file
    const highConfidenceDetections = detections.filter(d => d.detection.confidence >= 0.8).length;
    const recorderRank = calculateRecorderRank(highConfidenceDetections);
    
    return {
      recorderRank,
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        progress: 0,
        isUnlocked: false,
      })),
      totalUnlocked: 0,
      recentlyUnlocked: [],
      stats: {
        totalDetections: detections.length,
        highConfidenceDetections,
        uniqueSpecies: 0,
        averageConfidence: 0,
        recordingStreak: 0,
        bestConfidence: 0,
      },
    };
  }, [detections]);
}; 