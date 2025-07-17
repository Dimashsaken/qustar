/**
 * Achievement Badge Component
 * Displays individual achievement with progress
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { Achievement } from '../types/achievement';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface AchievementBadgeProps {
  achievement: Achievement;
  compact?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  compact = false 
}) => {
  const progressPercentage = achievement.requirement > 0 
    ? (achievement.progress! / achievement.requirement) * 100 
    : 0;

  return (
    <ThemedView style={[
      styles.container, 
      compact && styles.compactContainer,
      !achievement.isUnlocked && styles.lockedContainer
    ]}>
      <View style={[
        styles.iconContainer, 
        { backgroundColor: achievement.isUnlocked ? achievement.color : Colors.light.textMuted },
        compact && styles.compactIcon
      ]}>
        <IconSymbol 
          name={achievement.icon as any} 
          size={compact ? 20 : 24} 
          color={Colors.light.surface} 
        />
      </View>
      
      <View style={[styles.content, compact && styles.compactContent]}>
        <ThemedText 
          type={compact ? "default" : "subtitle"} 
          style={[
            styles.title,
            !achievement.isUnlocked && styles.lockedText
          ]}
        >
          {achievement.title}
        </ThemedText>
        
        {!compact && (
          <ThemedText 
            type="default" 
            style={[
              styles.description,
              !achievement.isUnlocked && styles.lockedText
            ]}
          >
            {achievement.description}
          </ThemedText>
        )}
        
        {!achievement.isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: achievement.color 
                  }
                ]} 
              />
            </View>
            <ThemedText type="default" style={styles.progressText}>
              {achievement.progress}/{achievement.requirement}
            </ThemedText>
          </View>
        )}
        
        {achievement.isUnlocked && achievement.unlockedAt && (
          <ThemedText type="default" style={styles.unlockedText}>
            Получено {achievement.unlockedAt.toLocaleDateString('ru-RU')}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    marginBottom: DesignTokens.spacing.sm,
  },
  compactContainer: {
    padding: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.xs,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: DesignTokens.spacing.sm,
  },
  content: {
    flex: 1,
  },
  compactContent: {
    justifyContent: 'center',
  },
  title: {
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: DesignTokens.spacing.xs,
  },
  description: {
    color: Colors.light.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing.sm,
  },
  lockedText: {
    color: Colors.light.textMuted,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignTokens.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: DesignTokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  unlockedText: {
    color: Colors.light.success,
    fontSize: 12,
    fontWeight: '500',
    marginTop: DesignTokens.spacing.xs,
  },
});
