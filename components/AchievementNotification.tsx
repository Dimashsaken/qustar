/**
 * Achievement Notification Component
 * Shows toast-style notification when user unlocks a new achievement
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { Achievement } from '../types/achievement';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface AchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable style={styles.notification} onPress={hideNotification}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: achievement.color }]}>
              <IconSymbol name={achievement.icon as any} size={20} color={Colors.light.surface} />
            </View>
            <View style={styles.textContainer}>
              <ThemedText type="default" style={styles.title}>
                🎉 Новое достижение!
              </ThemedText>
              <ThemedText type="subtitle" style={styles.achievementTitle}>
                {achievement.title}
              </ThemedText>
            </View>
            <Pressable onPress={hideNotification} style={styles.closeButton}>
              <IconSymbol name="xmark" size={16} color={Colors.light.textMuted} />
            </Pressable>
          </View>
          <ThemedText type="default" style={styles.description}>
            {achievement.description}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Account for status bar
    left: DesignTokens.spacing.md,
    right: DesignTokens.spacing.md,
    zIndex: 1000,
  },
  notification: {
    shadowColor: Colors.light.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.light.success,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementTitle: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    color: Colors.light.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    padding: DesignTokens.spacing.xs,
  },
});
