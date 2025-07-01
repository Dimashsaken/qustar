import { router } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { BirdListItem } from '../types/bird';
import { BirdImage } from './BirdImage';

interface BirdCardProps {
  bird: BirdListItem;
  variant?: 'list' | 'grid';
  imagePriority?: 'high' | 'normal' | 'low';
  onPress?: () => void;
}

// Get screen dimensions for grid calculations
const { width: screenWidth } = Dimensions.get('window');
const gridItemWidth = (screenWidth - 32) / 2 - 8;

/**
 * Bird card component for list or grid view display
 * Implements mobile-first design with 12px border radius and sky-blue accents
 * Shows essential bird information with navigation to detail screen
 * @param bird - Bird data to display
 * @param variant - Display variant: 'list' or 'grid'
 * @param imagePriority - Image priority: 'high', 'normal', or 'low'
 * @param onPress - Optional custom press handler
 * @returns JSX.Element - Pressable bird card component
 */
export const BirdCard: React.FC<BirdCardProps> = React.memo(({
  bird,
  variant = 'list',
  imagePriority = 'normal',
  onPress
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/bird/${bird.id}`);
    }
  };

  const displayName = bird.common_name_ru || bird.common_name_en || bird.scientific_name || 'Неизвестная птица';
  const kazakhName = bird.common_name_kz;
  const family = bird.family;
  const size = bird.size;

  const isGrid = variant === 'grid';
  const containerStyle = isGrid ? [styles.container, styles.gridContainer] : styles.container;
  const contentStyle = isGrid ? styles.gridContent : styles.listContent;
  const imageSize = isGrid ? 120 : 64;

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable 
        style={containerStyle} 
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Открыть информацию о птице ${bird.common_name_ru || bird.common_name_en}`}
      >
        <View style={contentStyle}>
          <View style={isGrid ? styles.gridImageContainer : styles.imageContainer}>
            <BirdImage 
              birdId={bird.id} 
              scientificName={bird.scientific_name}
              size={imageSize} 
              priority={imagePriority}
              style={isGrid ? styles.gridImage : styles.image}
            />
          </View>
          
          <View style={isGrid ? styles.gridTextContainer : styles.textContainer}>
            <Text style={styles.primaryName} numberOfLines={isGrid ? 2 : 1}>
              {displayName}
            </Text>
            
            {kazakhName && (
              <Text style={styles.kazakhName} numberOfLines={1}>
                {kazakhName}
              </Text>
            )}
            
            {!isGrid && (
              <View style={styles.metadataRow}>
                {family && (
                  <Text style={styles.metadata} numberOfLines={1}>
                    {family}
                  </Text>
                )}
                {size && (
                  <Text style={[styles.metadata, styles.size]} numberOfLines={1}>
                    {size}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: DesignTokens.spacing.lg,
    marginVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.card, // 12px corner radius
    ...DesignTokens.shadows.card, // 2px × 4px × 8px shadow
  },
  gridContainer: {
    width: gridItemWidth,
    marginHorizontal: DesignTokens.spacing.xs,
    marginVertical: DesignTokens.spacing.xs,
  },
  listContent: {
    flexDirection: 'row',
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
  },
  gridContent: {
    flexDirection: 'column',
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    minHeight: 180,
  },
  imageContainer: {
    marginRight: DesignTokens.spacing.md,
  },
  gridImageContainer: {
    marginRight: 0,
  },
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    width: '100%',
    marginTop: DesignTokens.spacing.sm,
    alignItems: 'center',
  },
  primaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
  },
  kazakhName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'SF Pro Display',
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginRight: 8,
    fontFamily: 'SF Pro Display',
  },
  size: {
    fontWeight: '500',
  },
  gridImage: {
    width: 80,
    height: 80,
  },
  image: {
    width: 64,
    height: 64,
  },
}); 