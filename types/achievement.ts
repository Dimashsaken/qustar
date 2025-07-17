/**
 * Achievement system types for QuStar bird recording app
 * Defines ranks, achievements, and progress tracking
 */

/**
 * Recording quality ranks based on high-confidence detections (>80%)
 */
export type RecorderRank = 
  | 'beginner'     // 0-4 high-confidence recordings
  | 'junior'       // 5-14 high-confidence recordings
  | 'intermediate' // 15-29 high-confidence recordings
  | 'advanced'     // 30-49 high-confidence recordings
  | 'expert'       // 50-99 high-confidence recordings
  | 'master';      // 100+ high-confidence recordings

/**
 * Achievement badge types
 */
export type AchievementType = 
  | 'recorder_rank'      // Main recording quality rank
  | 'species_explorer'   // Unique species discoveries
  | 'quality_detective'  // High average confidence
  | 'consistent_birder'  // Recording frequency
  | 'early_bird'         // Morning recordings
  | 'rare_finder';       // Finding uncommon species

/**
 * Achievement badge configuration
 */
export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  progress?: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

/**
 * User's recorder rank information
 */
export interface RecorderRankInfo {
  rank: RecorderRank;
  title: string;
  description: string;
  icon: string;
  color: string;
  currentProgress: number;
  nextRankThreshold: number | null;
  nextRankTitle?: string;
  progressPercentage: number;
}

/**
 * Complete user achievement stats
 */
export interface UserAchievements {
  recorderRank: RecorderRankInfo;
  achievements: Achievement[];
  totalUnlocked: number;
  recentlyUnlocked: Achievement[];
  stats: {
    totalDetections: number;
    highConfidenceDetections: number;
    uniqueSpecies: number;
    averageConfidence: number;
    recordingStreak: number;
    bestConfidence: number;
  };
}

/**
 * Achievement calculation input data
 */
export interface AchievementData {
  totalDetections: number;
  highConfidenceDetections: number;
  uniqueSpecies: number;
  averageConfidence: number;
  recentDetections: number;
  bestConfidence: number;
  recordingDates: Date[];
} 