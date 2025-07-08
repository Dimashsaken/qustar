/**
 * Enhanced Detection Card Component
 * Displays bird detection results with rich bird information, images, and metadata
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, DesignTokens } from '../constants/Colors';
import { useBirdBySpeciesName, useBirdImageUrls } from '../hooks/useBirds';
import type { DetectionWithAudio } from '../types/audio';
import { BirdImage } from './BirdImage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface DetectionCardProps {
  detection: DetectionWithAudio;
  onPress?: () => void;
}

/**
 * Fallback dictionary for common bird species in Russian
 * Used when bird data isn't found in database
 */
const RUSSIAN_BIRD_NAMES: Record<string, string> = {
  // Common birds that might be detected by BirdNet
  'Turdus merula': 'Чёрный дрозд',
  'Turdus pilaris': 'Рябинник',
  'Turdus philomelos': 'Певчий дрозд',
  'Passer domesticus': 'Домовый воробей',
  'Passer montanus': 'Полевой воробей',
  'Corvus cornix': 'Серая ворона',
  'Corvus corax': 'Ворон',
  'Pica pica': 'Сорока',
  'Sturnus vulgaris': 'Обыкновенный скворец',
  'Hirundo rustica': 'Деревенская ласточка',
  'Delichon urbicum': 'Городская ласточка',
  'Parus major': 'Большая синица',
  'Cyanistes caeruleus': 'Обыкновенная лазоревка',
  'Erithacus rubecula': 'Зарянка',
  'Phoenicurus phoenicurus': 'Горихвостка',
  'Muscicapa striata': 'Серая мухоловка',
  'Sylvia atricapilla': 'Черноголовая славка',
  'Phylloscopus collybita': 'Теньковка',
  'Phylloscopus trochilus': 'Весничка',
  'Acrocephalus scirpaceus': 'Тростниковая камышевка',
  'Motacilla alba': 'Белая трясогузка',
  'Anthus trivialis': 'Лесной конёк',
  'Fringilla coelebs': 'Зяблик',
  'Carduelis carduelis': 'Щегол',
  'Chloris chloris': 'Зеленушка',
  'Acanthis flammea': 'Чечётка',
  'Pyrrhula pyrrhula': 'Снегирь',
  'Emberiza citrinella': 'Обыкновенная овсянка',
  'Alauda arvensis': 'Полевой жаворонок',
  'Galerida cristata': 'Хохлатый жаворонок',
  'Columba livia': 'Сизый голубь',
  'Streptopelia decaocto': 'Кольчатая горлица',
  'Cuculus canorus': 'Обыкновенная кукушка',
  'Falco tinnunculus': 'Обыкновенная пустельга',
  'Accipiter nisus': 'Перепелятник',
  'Buteo buteo': 'Канюк',
  'Ardea cinerea': 'Серая цапля',
  'Fulica atra': 'Лысуха',
  'Gallinula chloropus': 'Камышница',
  'Anas platyrhynchos': 'Кряква',
  'Poecile palustris': 'Буроголовая гаичка',
  'Poecile montanus': 'Пухляк',
  'Sitta europaea': 'Поползень',
  'Certhia brachydactyla': 'Короткопалая пищуха',
  'Troglodytes troglodytes': 'Крапивник',
};

/**
 * Enhanced card component for displaying bird detection results
 */
export const DetectionCard: React.FC<DetectionCardProps> = ({ 
  detection, 
  onPress 
}) => {
  const { data: birdData } = useBirdBySpeciesName(detection.detection.species);
  const { data: imageUrls = [] } = useBirdImageUrls(
    birdData?.id || '', 
    birdData?.scientific_name
  );

  const confidencePercentage = Math.round(detection.detection.confidence * 100);
  const recordedDate = new Date(detection.audioUpload.recorded_at);
  
  // Get display names with fallbacks
  const getDisplayName = () => {
    if (birdData) {
      // Prioritize Russian name only, with fallbacks
      return birdData.common_name_ru || birdData.common_name_en || birdData.scientific_name;
    }
    
    // If no bird data found, try fallback dictionary first
    const speciesName = detection.detection.species.replace(/_/g, ' ');
    const russianName = RUSSIAN_BIRD_NAMES[speciesName];
    
    if (russianName) {
      return russianName;
    }
    
    // Final fallback: format the scientific name nicely
    return speciesName;
  };

  const getScientificName = () => {
    if (birdData?.scientific_name) {
      return birdData.scientific_name;
    }
    
    // Show scientific name from detection
    const speciesName = detection.detection.species.replace(/_/g, ' ');
    const russianName = RUSSIAN_BIRD_NAMES[speciesName];
    
    // If we found a Russian name, show the scientific name in subtitle
    // If not, indicate we're searching
    return russianName ? speciesName : `${speciesName} (поиск в базе...)`;
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
              <Ionicons name="musical-note" size={32} color={Colors.light.tabIconDefault} />
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
          <View style={styles.header}>
            <ThemedText style={styles.birdName} numberOfLines={1}>
              {getDisplayName()}
            </ThemedText>
            
            {/* Audio Indicator */}
            <View style={styles.audioIndicator}>
              <Ionicons name="volume-medium" size={16} color={Colors.light.tint} />
            </View>
          </View>

          <ThemedText style={styles.scientificName} numberOfLines={1}>
            {getScientificName()}
          </ThemedText>

          {/* Bird Details */}
          {birdData && (
            <View style={styles.detailsRow}>
              {birdData.family && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Семейство:</Text>
                  <Text style={styles.detailValue}>{birdData.family}</Text>
                </View>
              )}
              {birdData.size && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Размер:</Text>
                  <Text style={styles.detailValue}>{birdData.size}</Text>
                </View>
              )}
            </View>
          )}

          {/* Recording Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="time-outline" size={14} color={Colors.light.tabIconDefault} />
              <Text style={styles.metadataText}>
                {recordedDate.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Ionicons name="timer-outline" size={14} color={Colors.light.tabIconDefault} />
              <Text style={styles.metadataText}>
                {detection.detection.start_sec.toFixed(1)}-{detection.detection.end_sec.toFixed(1)}s
              </Text>
            </View>
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
    ...DesignTokens.shadows.card,
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing.md,
  },
  birdImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 64,
    height: 64,
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
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  birdName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  audioIndicator: {
    marginLeft: DesignTokens.spacing.xs,
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.light.tabIconDefault,
    marginBottom: DesignTokens.spacing.xs,
  },
  
  // Details Section
  detailsRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xs,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '400',
  },

  // Metadata Section
  metadata: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    marginTop: DesignTokens.spacing.xs,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
  },

  // Arrow Section
  arrowContainer: {
    justifyContent: 'center',
    marginLeft: DesignTokens.spacing.xs,
  },
}); 