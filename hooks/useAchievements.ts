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
    id: 'species_collector_10',
    type: 'species_explorer',
    title: 'Исследователь видов',
    description: 'Найдите 10 разных видов птиц',
    icon: 'library',
    color: '#30D158',
    requirement: 10,
  },
  {
    id: 'species_collector_15',
    type: 'species_explorer',
    title: 'Знаток видов',
    description: 'Найдите 15 разных видов птиц',
    icon: 'books.vertical',
    color: '#30D158',
    requirement: 15,
  },
  {
    id: 'species_collector_25',
    type: 'species_explorer',
    title: 'Мастер видов',
    description: 'Найдите 25 разных видов птиц',
    icon: 'graduationcap',
    color: '#30D158',
    requirement: 25,
  },
  {
    id: 'quality_master',
    type: 'quality_detective',
    title: 'Мастер качества',
    description: 'Достигните средней точности 85%',
    icon: 'checkmark.circle',
    color: '#FF9500',
    requirement: 85,
  },
  {
    id: 'consistent_birder_3',
    type: 'consistent_birder',
    title: 'Начинающий орнитолог',
    description: 'Записывайте птиц 3 дня подряд',
    icon: 'calendar',
    color: '#8E8E93',
    requirement: 3,
  },
  {
    id: 'consistent_birder_7',
    type: 'consistent_birder',
    title: 'Постоянный исследователь',
    description: 'Записывайте птиц 7 дней подряд',
    icon: 'calendar.badge.plus',
    color: '#8E8E93',
    requirement: 7,
  },
  {
    id: 'consistent_birder_14',
    type: 'consistent_birder',
    title: 'Преданный орнитолог',
    description: 'Записывайте птиц 14 дней подряд',
    icon: 'calendar.badge.checkmark',
    color: '#8E8E93',
    requirement: 14,
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
  {
    id: 'productive_recorder_10',
    type: 'recorder_rank',
    title: 'Продуктивный записывающий',
    description: 'Сделайте 10 качественных записей',
    icon: 'waveform.path',
    color: '#007AFF',
    requirement: 10,
  },
  {
    id: 'productive_recorder_25',
    type: 'recorder_rank',
    title: 'Опытный записывающий',
    description: 'Сделайте 25 качественных записей',
    icon: 'waveform.path.ecg',
    color: '#007AFF',
    requirement: 25,
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
    nextRankTitle: nextRank ? RANK_CONFIG[nextRank].title : undefined,
    progressPercentage,
  };
};

/**
 * Calculate consecutive recording days streak
 */
const calculateRecordingStreak = (detections: DetectionWithAudio[]): number => {
  if (detections.length === 0) return 0;
  
  // Get unique recording dates sorted in descending order
  const recordingDates = [...new Set(
    detections
      .filter(d => d.detection.created_at)
      .map(d => new Date(d.detection.created_at!).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < recordingDates.length; i++) {
    const recordingDate = new Date(recordingDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (recordingDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculate user statistics from detections
 */
const calculateUserStats = (detections: DetectionWithAudio[]) => {
  const totalDetections = detections.length;
  const highConfidenceDetections = detections.filter(d => d.detection.confidence >= 0.8).length;
  const uniqueSpecies = new Set(detections.map(d => d.detection.species)).size;
  const averageConfidence = totalDetections > 0 
    ? detections.reduce((sum, d) => sum + d.detection.confidence, 0) / totalDetections * 100
    : 0;
  const bestConfidence = totalDetections > 0
    ? Math.max(...detections.map(d => d.detection.confidence)) * 100
    : 0;
  const recordingStreak = calculateRecordingStreak(detections);

  return {
    totalDetections,
    highConfidenceDetections,
    uniqueSpecies,
    averageConfidence,
    recordingStreak,
    bestConfidence,
  };
};

/**
 * Calculate achievement progress and unlock status
 */
const calculateAchievements = (stats: ReturnType<typeof calculateUserStats>, detections: DetectionWithAudio[]): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let progress = 0;
    let isUnlocked = false;
    
    switch (def.type) {
      case 'recorder_rank':
        progress = stats.highConfidenceDetections;
        isUnlocked = progress >= def.requirement;
        break;
        
      case 'species_explorer':
        progress = stats.uniqueSpecies;
        isUnlocked = progress >= def.requirement;
        break;
        
      case 'quality_detective':
        if (def.id === 'quality_master') {
          progress = Math.round(stats.averageConfidence);
          isUnlocked = progress >= def.requirement;
        } else if (def.id === 'perfectionist') {
          progress = Math.round(stats.bestConfidence);
          isUnlocked = progress >= def.requirement;
        }
        break;
        
      case 'consistent_birder':
        progress = stats.recordingStreak;
        isUnlocked = progress >= def.requirement;
        break;
    }
    
    return {
      ...def,
      progress: Math.min(progress, def.requirement),
      isUnlocked,
      unlockedAt: isUnlocked ? new Date() : undefined,
    };
  });
};

/**
 * Hook for calculating and managing user achievements
 * @param detections - User's detection data
 * @returns User achievements and statistics
 */
export const useAchievements = (detections: DetectionWithAudio[]): UserAchievements => {
  return useMemo(() => {
    const stats = calculateUserStats(detections);
    const recorderRank = calculateRecorderRank(stats.highConfidenceDetections);
    const achievements = calculateAchievements(stats, detections);
    
    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    const recentlyUnlocked = unlockedAchievements.slice(-3); // Last 3 unlocked
    
    return {
      recorderRank,
      achievements,
      totalUnlocked: unlockedAchievements.length,
      recentlyUnlocked,
      stats,
    };
  }, [detections]);
}; 