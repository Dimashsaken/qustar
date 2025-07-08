/**
 * Simplified Detection Card Component
 * Displays bird detection results with basic information
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, DesignTokens } from '../constants/Colors';
import { useBirdBySpeciesName } from '../hooks/useBirds';
import type { DetectionWithAudio } from '../types/audio';
import { BirdImage } from './BirdImage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface DetectionCardProps {
  detection: DetectionWithAudio;
  onPress?: () => void;
}

/**
 * Simplified card component for displaying bird detection results
 */
export const DetectionCard: React.FC<DetectionCardProps> = ({ 
  detection, 
  onPress 
}) => {
  const { data: birdData } = useBirdBySpeciesName(detection.detection.species);
  
  const confidencePercentage = Math.round(detection.detection.confidence * 100);
  
  // Get display name with simple fallback
  const getDisplayName = () => {
    if (birdData) {
      return birdData.common_name_ru || birdData.common_name_en || birdData.scientific_name;
    }
    
    // Simple fallback: format the species name
    return detection.detection.species.replace(/_/g, ' ');
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (birdData?.id) {
      router.push(`/bird/${birdData.id}`);
    }
  };

  return (
    <Pressable 
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={`Bird detection: ${getDisplayName()}`}
    >
      <ThemedView 
        {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} 
        style={styles.card}
      >
        {/* Bird Image */}
        <View style={styles.imageContainer}>
          {birdData?.id ? (
            <BirdImage
              birdId={birdData.id}
              scientificName={birdData.scientific_name}
              style={styles.birdImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="musical-note" size={24} color={Colors.light.tabIconDefault} />
            </View>
          )}
          
          {/* Confidence Badge */}
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(confidencePercentage) }
          ]}>
            <Text style={styles.confidenceText}>{confidencePercentage}%</Text>
          </View>
        </View>

        {/* Bird Information */}
        <View style={styles.content}>
          <ThemedText style={styles.birdName} numberOfLines={2}>
            {getDisplayName()}
          </ThemedText>
          
          {birdData?.scientific_name && (
            <ThemedText style={styles.scientificName} numberOfLines={1}>
              {birdData.scientific_name}
            </ThemedText>
          )}
          
          {/* Detection Time */}
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={Colors.light.tabIconDefault} />
            <ThemedText style={styles.timeText}>
              {formatDetectionTime(detection.detection.start_sec, detection.detection.end_sec)}
            </ThemedText>
          </View>
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={Colors.light.tabIconDefault} 
          />
        </View>
      </ThemedView>
    </Pressable>
  );
};

/**
 * Get confidence color based on percentage
 */
const getConfidenceColor = (percentage: number): string => {
  if (percentage >= 80) return '#27AE60'; // Green
  if (percentage >= 60) return '#F39C12'; // Orange
  return '#E74C3C'; // Red
};

/**
 * Format detection time range as readable string
 */
const formatDetectionTime = (startSec: number, endSec: number): string => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`;
  };
  
  return `${formatTime(startSec)} - ${formatTime(endSec)}`;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: DesignTokens.spacing.xs,
  },
  card: {
    flexDirection: 'row',
    padding: DesignTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing.md,
  },
  birdImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  confidenceBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 32,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },

  // Content Section
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  birdName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.light.tabIconDefault,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },

  // Arrow Section
  arrowContainer: {
    justifyContent: 'center',
    marginLeft: DesignTokens.spacing.xs,
  },
}); 