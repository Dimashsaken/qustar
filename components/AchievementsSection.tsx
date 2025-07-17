/**
 * Achievements Section Component
 * Displays user's achievements and progress in the profile
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { UserAchievements } from '../types/achievement';
import { AchievementBadge } from './AchievementBadge';
import { RankProgress } from './RankProgress';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface AchievementsSectionProps {
  userAchievements: UserAchievements;
  isExpanded?: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ 
  userAchievements,
  isExpanded = false 
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  const unlockedAchievements = userAchievements.achievements.filter(a => a.isUnlocked);
  const lockedAchievements = userAchievements.achievements.filter(a => !a.isUnlocked);
  
  const displayedAchievements = expanded 
    ? userAchievements.achievements 
    : [...unlockedAchievements.slice(0, 3), ...lockedAchievements.slice(0, 2)];

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <IconSymbol name="trophy.fill" size={22} color={Colors.light.surface} />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Достижения
            </ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              {userAchievements.totalUnlocked} из {userAchievements.achievements.length} получено
            </ThemedText>
          </View>
          <View style={styles.arrowContainer}>
            <IconSymbol 
              name={expanded ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={Colors.light.primary} 
            />
          </View>
        </View>
      </Pressable>

      <View style={styles.content}>
        {/* Rank Progress */}
        <RankProgress rankInfo={userAchievements.recorderRank} />

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <ThemedText type="subtitle" style={styles.statsTitle}>
            Статистика
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {userAchievements.stats.totalDetections}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Всего записей
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {userAchievements.stats.uniqueSpecies}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Видов найдено
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {Math.round(userAchievements.stats.averageConfidence)}%
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Средняя точность
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {userAchievements.stats.recordingStreak}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Дней подряд
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Recently Unlocked */}
        {userAchievements.recentlyUnlocked.length > 0 && (
          <View style={styles.recentSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Недавно получено
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {userAchievements.recentlyUnlocked.map((achievement) => (
                <View key={achievement.id} style={styles.recentItem}>
                  <AchievementBadge achievement={achievement} compact />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Все достижения
          </ThemedText>
          
          {displayedAchievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
          
          {!expanded && userAchievements.achievements.length > 5 && (
            <Pressable style={styles.showMoreButton} onPress={() => setExpanded(true)}>
              <ThemedText type="default" style={styles.showMoreText}>
                Показать еще {userAchievements.achievements.length - 5} достижений
              </ThemedText>
              <IconSymbol name="chevron.down" size={16} color={Colors.light.primary} />
            </Pressable>
          )}
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    marginTop: DesignTokens.spacing.sm,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.light.textMuted,
    fontSize: 12,
    marginTop: DesignTokens.spacing.xs,
  },
  arrowContainer: {
    paddingLeft: DesignTokens.spacing.sm,
  },
  content: {
    padding: DesignTokens.spacing.lg,
  },
  statsContainer: {
    marginTop: DesignTokens.spacing.lg,
  },
  statsTitle: {
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: DesignTokens.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.background,
    borderRadius: DesignTokens.borderRadius.card,
    marginBottom: DesignTokens.spacing.sm,
  },
  statNumber: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.light.textMuted,
    fontSize: 12,
    marginTop: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
  recentSection: {
    marginTop: DesignTokens.spacing.lg,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: DesignTokens.spacing.md,
  },
  recentList: {
    paddingRight: DesignTokens.spacing.lg,
  },
  recentItem: {
    width: 250,
    marginRight: DesignTokens.spacing.md,
  },
  achievementsContainer: {
    marginTop: DesignTokens.spacing.lg,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: DesignTokens.borderRadius.card,
    marginTop: DesignTokens.spacing.sm,
  },
  showMoreText: {
    color: Colors.light.primary,
    fontWeight: '500',
    marginRight: DesignTokens.spacing.xs,
  },
});
