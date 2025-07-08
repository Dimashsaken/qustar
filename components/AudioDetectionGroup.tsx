/**
 * Simplified Audio Detection Group Component
 * Groups multiple bird detections from the same audio recording
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, DesignTokens } from '../constants/Colors';
import type { DetectionWithAudio } from '../types/audio';
import { DetectionCard } from './DetectionCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AudioDetectionGroupProps {
  audioId: string;
  detections: DetectionWithAudio[];
}

/**
 * Simplified component that groups and displays detections from same audio recording
 */
export const AudioDetectionGroup: React.FC<AudioDetectionGroupProps> = ({
  audioId,
  detections,
}) => {
  if (!detections.length) return null;

  // Sort detections by start time for logical display order
  const sortedDetections = [...detections].sort((a, b) => a.detection.start_sec - b.detection.start_sec);

  return (
    <ThemedView 
      {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} 
      style={styles.container}
    >
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="musical-notes" size={18} color={Colors.light.tint} />
        </View>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.audioTitle}>
            Аудиозапись
          </ThemedText>
        </View>
        
        <View style={styles.detectionCount}>
          <Text style={styles.countText}>{sortedDetections.length}</Text>
        </View>
      </View>

      {/* Detection Cards */}
      <View style={styles.detectionsContainer}>
        {sortedDetections.map((detection) => (
          <DetectionCard 
            key={detection.detection.id}
            detection={detection}
          />
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: DesignTokens.spacing.lg,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
  },
  
  headerContent: {
    flex: 1,
  },
  
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  
  detectionCount: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  detectionsContainer: {
    padding: DesignTokens.spacing.sm,
  },
}); 