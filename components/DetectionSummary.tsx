/**
 * Detection Summary Component
 * Shows statistics and highlights of user's bird detection history
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, DesignTokens } from '../constants/Colors';
import type { DetectionWithAudio } from '../types/audio';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface DetectionSummaryProps {
  detections: DetectionWithAudio[];
}

/**
 * Component that displays summary statistics of user's detections
 */
export const DetectionSummary: React.FC<DetectionSummaryProps> = ({ 
  detections 
}) => {
  if (detections.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalDetections = detections.length;
  const uniqueSpecies = new Set(detections.map(d => d.detection.species)).size;
  const averageConfidence = detections.reduce((sum, d) => sum + d.detection.confidence, 0) / totalDetections;
  const highConfidenceDetections = detections.filter(d => d.detection.confidence >= 0.8).length;
  
  // Get recent detections (last 24 hours)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentDetections = detections.filter(d => 
    new Date(d.audioUpload.recorded_at).getTime() > oneDayAgo
  ).length;

  // Get most confident detection
  const bestDetection = detections.reduce((best, current) => 
    current.detection.confidence > best.detection.confidence ? current : best
  );

  return (
    <ThemedView 
      {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} 
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>📊 Статистика обнаружений</ThemedText>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="musical-notes" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.statNumber}>{totalDetections}</Text>
          <Text style={styles.statLabel}>Всего записей</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="library" size={20} color={Colors.light.accent} />
          </View>
          <Text style={styles.statNumber}>{uniqueSpecies}</Text>
          <Text style={styles.statLabel}>Видов птиц</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.light.success} />
          </View>
          <Text style={styles.statNumber}>{Math.round(averageConfidence * 100)}%</Text>
          <Text style={styles.statLabel}>Точность</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="today" size={20} color={Colors.light.info} />
          </View>
          <Text style={styles.statNumber}>{recentDetections}</Text>
          <Text style={styles.statLabel}>За 24 часа</Text>
        </View>
      </View>

      {/* Highlights */}
      {highConfidenceDetections > 0 && (
        <View style={styles.highlight}>
          <View style={styles.highlightHeader}>
            <Ionicons name="star" size={16} color={Colors.light.accent} />
            <Text style={styles.highlightTitle}>
              {highConfidenceDetections} точных обнаружения (≥80%)
            </Text>
          </View>
        </View>
      )}

      {/* Best Detection */}
      <View style={styles.bestDetection}>
        <View style={styles.bestDetectionHeader}>
          <Ionicons name="trophy" size={16} color={Colors.light.primary} />
          <Text style={styles.bestDetectionTitle}>Лучшее обнаружение</Text>
        </View>
        <Text style={styles.bestDetectionSpecies}>
          {bestDetection.detection.species.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.bestDetectionConfidence}>
          {Math.round(bestDetection.detection.confidence * 100)}% уверенности
        </Text>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: DesignTokens.spacing.md,
    padding: DesignTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    ...DesignTokens.shadows.card,
  },
  
  header: {
    marginBottom: DesignTokens.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },

  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    marginBottom: DesignTokens.spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },

  // Highlights
  highlight: {
    padding: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 8,
    marginBottom: DesignTokens.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.accent,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },

  // Best Detection
  bestDetection: {
    padding: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  bestDetectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
    marginBottom: DesignTokens.spacing.xs,
  },
  bestDetectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  bestDetectionSpecies: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  bestDetectionConfidence: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
  },
}); 