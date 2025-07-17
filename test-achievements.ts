/**
 * Test Achievement System Implementation
 * This file demonstrates how the achievements system works
 */

import type { DetectionWithAudio } from '../types/audio';
import { useAchievements } from '../hooks/useAchievements';

// Example detection data for testing
const mockDetections: DetectionWithAudio[] = [
  {
    id: '1',
    audio: { id: '1', path: '/path/to/audio1.wav', duration: 30 },
    detection: {
      id: '1',
      species: 'Turdus merula',
      confidence: 0.85,
      start_time: 5.0,
      end_time: 8.0,
      created_at: new Date().toISOString(),
      user_id: 'user1',
      audio_id: '1',
    },
  },
  {
    id: '2',
    audio: { id: '2', path: '/path/to/audio2.wav', duration: 45 },
    detection: {
      id: '2',
      species: 'Passer domesticus',
      confidence: 0.92,
      start_time: 10.0,
      end_time: 15.0,
      created_at: new Date().toISOString(),
      user_id: 'user1',
      audio_id: '2',
    },
  },
  {
    id: '3',
    audio: { id: '3', path: '/path/to/audio3.wav', duration: 60 },
    detection: {
      id: '3',
      species: 'Erithacus rubecula',
      confidence: 0.78,
      start_time: 20.0,
      end_time: 25.0,
      created_at: new Date().toISOString(),
      user_id: 'user1',
      audio_id: '3',
    },
  },
];

// Example usage in a component
export const TestAchievements = () => {
  const userAchievements = useAchievements(mockDetections);

  console.log('User Achievements:', {
    rank: userAchievements.recorderRank,
    totalUnlocked: userAchievements.totalUnlocked,
    stats: userAchievements.stats,
    achievements: userAchievements.achievements.map(a => ({
      id: a.id,
      title: a.title,
      isUnlocked: a.isUnlocked,
      progress: a.progress,
      requirement: a.requirement,
    })),
  });

  return userAchievements;
};

// Achievement System Features:
// 1. Rank System - Based on high-confidence detections (>80%)
// 2. Species Explorer - Track unique species discovered
// 3. Quality Detective - Reward high accuracy recordings
// 4. Consistent Birder - Encourage daily recording habits
// 5. Progress Tracking - Show progress toward next achievements
// 6. Achievement Notifications - Celebrate when unlocked

// How to use:
// 1. Import useAchievements hook
// 2. Pass user's detection data
// 3. Display achievements in profile
// 4. Show notifications for new achievements
// 5. Allow users to view full achievements page
