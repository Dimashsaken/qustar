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
  
  // Get display name with enhanced Russian language priority and fallbacks
  const getDisplayName = () => {
    // First priority: Use display_name from BirdNET (Russian name when available)
    if (detection.detection.display_name && detection.detection.display_name.trim()) {
      return detection.detection.display_name;
    }
    
    // Second priority: Use database Russian name if BirdNET failed to provide it
    if (birdData?.common_name_ru && birdData.common_name_ru.trim()) {
      return birdData.common_name_ru;
    }
    
    // Third priority: Use common_name from BirdNET (English fallback)
    if (detection.detection.common_name && detection.detection.common_name.trim()) {
      return detection.detection.common_name;
    }
    
    // Fourth priority: Use database English name
    if (birdData?.common_name_en && birdData.common_name_en.trim()) {
      return birdData.common_name_en;
    }
    
    // Fifth priority: Use database Kazakh name
    if (birdData?.common_name_kz && birdData.common_name_kz.trim()) {
      return birdData.common_name_kz;
    }
    
    // Sixth priority: Use scientific name from database
    if (birdData?.scientific_name && birdData.scientific_name.trim()) {
      return birdData.scientific_name;
    }
    
    // Final fallback: Format species name from detection
    if (detection.detection.species) {
      // Handle different species formats:
      // "Common Name_Scientific Name" -> "Common Name"
      // "Scientific_Name" -> "Scientific Name"
      const species = detection.detection.species;
      if (species.includes('_')) {
        const parts = species.split('_');
        // If first part looks like a common name (contains spaces or multiple words), use it
        const firstPart = parts[0];
        if (firstPart.includes(' ') || firstPart.length > 3) {
          return firstPart;
        }
        // Otherwise use the full formatted name
        return species.replace(/_/g, ' ');
      }
      return species;
    }
    
    return 'Неизвестная птица'; // "Unknown bird" in Russian
  };

  // Get scientific name for display
  const getScientificName = () => {
    // Try database first for consistency
    if (birdData?.scientific_name) {
      return birdData.scientific_name;
    }
    
    // Extract from species field if in "Common_Scientific" format
    if (detection.detection.species && detection.detection.species.includes('_')) {
      const parts = detection.detection.species.split('_');
      if (parts.length >= 2) {
        return parts.slice(1).join(' '); // Join back in case scientific name has spaces
      }
    }
    
    // Use species as-is if it looks scientific (genus species format)
    if (detection.detection.species) {
      const species = detection.detection.species.replace(/_/g, ' ');
      // Check if it looks like a scientific name (starts with capital letter, has space)
      if (/^[A-Z][a-z]+ [a-z]+/.test(species)) {
        return species;
      }
    }
    
    return null;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (birdData?.id) {
      router.push(`/bird/${birdData.id}`);
    }
  };

  const displayName = getDisplayName();
  const scientificName = getScientificName();

  return (
    <Pressable 
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={`Bird detection: ${displayName}`}
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
            {displayName}
          </ThemedText>
          
          {scientificName && (
            <ThemedText style={styles.scientificName} numberOfLines={1}>
              {scientificName}
            </ThemedText>
          )}
          
          {/* Detection Time */}
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={Colors.light.tabIconDefault} />
            <ThemedText style={styles.timeText}>
              {formatDetectionTime(detection.detection.start_sec, detection.detection.end_sec)}
            </ThemedText>
          </View>
          
          {/* Debug info for development - remove in production */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <ThemedText style={styles.debugText}>
                BirdNET: display="{detection.detection.display_name}", common="{detection.detection.common_name}"
              </ThemedText>
              <ThemedText style={styles.debugText}>
                DB: ru="{birdData?.common_name_ru}", en="{birdData?.common_name_en}"
              </ThemedText>
            </View>
          )}
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
    color: Colors.light.textMuted,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginLeft: 4,
  },
  
  // Debug Section (development only)
  debugContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  
  // Arrow Section
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: DesignTokens.spacing.sm,
  },
}); 