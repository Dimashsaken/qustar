/**
 * Achievement Notification Hook
 * Manages display of achievement unlock notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Achievement } from '../types/achievement';

const SHOWN_ACHIEVEMENTS_KEY = 'shown_achievements';

export const useAchievementNotifications = (achievements: Achievement[]) => {
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const [pendingNotification, setPendingNotification] = useState<Achievement | null>(null);

  // Load previously shown achievements from storage
  useEffect(() => {
    loadShownAchievements();
  }, []);

  // Check for new achievements to show
  useEffect(() => {
    checkForNewAchievements();
  }, [achievements, shownAchievements]);

  const loadShownAchievements = async () => {
    try {
      const stored = await AsyncStorage.getItem(SHOWN_ACHIEVEMENTS_KEY);
      if (stored) {
        setShownAchievements(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading shown achievements:', error);
    }
  };

  const checkForNewAchievements = () => {
    const newUnlockedAchievements = achievements.filter(
      achievement => 
        achievement.isUnlocked && 
        !shownAchievements.includes(achievement.id)
    );

    if (newUnlockedAchievements.length > 0 && !pendingNotification) {
      // Show the first new achievement
      const achievementToShow = newUnlockedAchievements[0];
      setPendingNotification(achievementToShow);
    }
  };

  const markAchievementAsShown = async (achievementId: string) => {
    try {
      const updated = [...shownAchievements, achievementId];
      setShownAchievements(updated);
      await AsyncStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving shown achievement:', error);
    }
  };

  const dismissNotification = () => {
    if (pendingNotification) {
      markAchievementAsShown(pendingNotification.id);
      setPendingNotification(null);
    }
  };

  return {
    pendingNotification,
    dismissNotification,
    hasNewAchievements: achievements.some(
      a => a.isUnlocked && !shownAchievements.includes(a.id)
    ),
  };
};
