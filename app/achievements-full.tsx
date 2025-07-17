/**
 * Achievements Full Page
 * Complete view of user's achievements, ranks, and statistics
 */

import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { AchievementBadge } from '../components/AchievementBadge';
import { RankProgress } from '../components/RankProgress';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAchievements } from '../hooks/useAchievements';
import { useAudioDetections } from '../hooks/useAudioDetections';
import { useAuth } from '../hooks/useAuth';

type FilterType = 'all' | 'unlocked' | 'locked';

export default function AchievementsFullScreen() {
  const { user } = useAuth();
  const { detections, isLoading: detectionsLoading } = useAudioDetections();
  const userAchievements = useAchievements(detections);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAchievements = userAchievements.achievements.filter(achievement => {
    switch (filter) {
      case 'unlocked':
        return achievement.isUnlocked;
      case 'locked':
        return !achievement.isUnlocked;
      default:
        return true;
    }
  });

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={Colors.light.primary} />
      </Pressable>
      <ThemedText type="title" style={styles.headerTitle}>
        Достижения
      </ThemedText>
      <View style={styles.headerSpace} />
    </ThemedView>
  );

  const renderStatsOverview = () => (
    <ThemedView style={styles.statsOverview}>
      <ThemedText type="subtitle" style={styles.statsTitle}>
        Общая статистика
      </ThemedText>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {userAchievements.totalUnlocked}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Достижений получено
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {userAchievements.stats.totalDetections}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Всего записей
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {userAchievements.stats.uniqueSpecies}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Уникальных видов
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {Math.round(userAchievements.stats.averageConfidence)}%
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Средняя точность
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {userAchievements.stats.recordingStreak}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Дней подряд
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText type="title" style={styles.statNumber}>
            {Math.round(userAchievements.stats.bestConfidence)}%
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Лучшая точность
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  const renderFilter = () => (
    <View style={styles.filterContainer}>
      <Pressable
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          Все ({userAchievements.achievements.length})
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'unlocked' && styles.filterButtonActive]}
        onPress={() => setFilter('unlocked')}
      >
        <ThemedText style={[styles.filterText, filter === 'unlocked' && styles.filterTextActive]}>
          Получено ({userAchievements.totalUnlocked})
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'locked' && styles.filterButtonActive]}
        onPress={() => setFilter('locked')}
      >
        <ThemedText style={[styles.filterText, filter === 'locked' && styles.filterTextActive]}>
          Не получено ({userAchievements.achievements.length - userAchievements.totalUnlocked})
        </ThemedText>
      </Pressable>
    </View>
  );

  if (detectionsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor="transparent" translucent />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ThemedText type="default" style={styles.loadingText}>
            Загрузка достижений...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Rank Progress */}
          <View style={styles.section}>
            <RankProgress rankInfo={userAchievements.recorderRank} />
          </View>

          {/* Statistics Overview */}
          {renderStatsOverview()}

          {/* Recently Unlocked */}
          {userAchievements.recentlyUnlocked.length > 0 && (
            <ThemedView style={styles.recentSection}>
              <ThemedText type="subtitle" style={styles.recentTitle}>
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
            </ThemedView>
          )}

          {/* Achievements Filter */}
          {renderFilter()}

          {/* Achievements List */}
          <View style={styles.achievementsContainer}>
            {filteredAchievements.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <IconSymbol name="trophy" size={48} color={Colors.light.textMuted} />
                <ThemedText type="default" style={styles.emptyText}>
                  {filter === 'unlocked' 
                    ? 'У вас пока нет открытых достижений' 
                    : 'Нет достижений для отображения'}
                </ThemedText>
              </ThemedView>
            ) : (
              filteredAchievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    paddingRight: DesignTokens.spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.light.text,
    fontWeight: '600',
  },
  headerSpace: {
    width: 24 + DesignTokens.spacing.md,
  },
  section: {
    margin: DesignTokens.spacing.lg,
  },
  statsOverview: {
    backgroundColor: Colors.light.surface,
    padding: DesignTokens.spacing.lg,
    marginTop: DesignTokens.spacing.sm,
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
  statCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.light.textMuted,
    fontSize: 12,
    marginTop: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    marginTop: DesignTokens.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
    alignItems: 'center',
    marginHorizontal: DesignTokens.spacing.xs,
    backgroundColor: Colors.light.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.light.surface,
  },
  achievementsContainer: {
    padding: DesignTokens.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.xl * 2,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
  },
  emptyText: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: DesignTokens.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.light.textMuted,
    marginTop: DesignTokens.spacing.md,
  },
  recentSection: {
    backgroundColor: Colors.light.surface,
    padding: DesignTokens.spacing.lg,
    marginTop: DesignTokens.spacing.sm,
  },
  recentTitle: {
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
});
