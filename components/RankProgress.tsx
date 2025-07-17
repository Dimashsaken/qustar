/**
 * Rank Progress Component
 * Displays user's current rank and progress to next rank
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { RecorderRankInfo } from '../types/achievement';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface RankProgressProps {
  rankInfo: RecorderRankInfo;
}

export const RankProgress: React.FC<RankProgressProps> = ({ rankInfo }) => {
  const progressWidth = Math.max(8, (rankInfo.progressPercentage / 100) * 100);
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.rankIcon, { backgroundColor: rankInfo.color }]}>
          <IconSymbol name={rankInfo.icon as any} size={28} color={Colors.light.surface} />
        </View>
        <View style={styles.rankInfo}>
          <ThemedText type="subtitle" style={styles.rankTitle}>
            {rankInfo.title}
          </ThemedText>
          <ThemedText type="default" style={styles.rankDescription}>
            {rankInfo.description}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText type="default" style={styles.progressText}>
            {rankInfo.currentProgress} качественных записей
          </ThemedText>
          {rankInfo.nextRankThreshold && (
            <ThemedText type="default" style={styles.nextRankText}>
              {rankInfo.nextRankThreshold - rankInfo.currentProgress} до следующего ранга
            </ThemedText>
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressWidth}%`,
                backgroundColor: rankInfo.color 
              }
            ]} 
          />
        </View>
        
        {rankInfo.nextRankThreshold && (
          <View style={styles.progressLabels}>
            <ThemedText type="default" style={styles.progressLabel}>
              {rankInfo.currentProgress}
            </ThemedText>
            <ThemedText type="default" style={styles.progressLabel}>
              {rankInfo.nextRankThreshold}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: DesignTokens.spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  rankIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    color: Colors.light.text,
    fontWeight: 'bold',
    marginBottom: DesignTokens.spacing.xs,
  },
  rankDescription: {
    color: Colors.light.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: DesignTokens.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  progressText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
  nextRankText: {
    color: Colors.light.textMuted,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: Colors.light.textMuted,
    fontSize: 12,
  },
});
