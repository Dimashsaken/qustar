import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useBirdImageUrls } from '../hooks/useBirds';
import { getBirdImageCacheKey } from '../lib/imageUtils';

interface BirdImageProps {
  birdId: string;
  scientificName?: string | null;
  size?: number;
  style?: any;
  priority?: 'high' | 'normal' | 'low';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

/**
 * Optimized bird image component with React Query caching
 * @param birdId - Bird ID for image lookup
 * @param scientificName - Scientific name for constructing filename
 * @param size - Image dimensions (default: 64)
 * @param style - Additional styles
 * @param priority - Loading priority for performance optimization
 * @returns JSX.Element - Image component with fallback
 */
export const BirdImage: React.FC<BirdImageProps> = React.memo(({ 
  birdId, 
  scientificName,
  size = 64, 
  style,
  priority = 'normal',
  onLoadStart,
  onLoadEnd
}) => {
  // Use React Query for caching image URLs
  const { data: imageUrls = [], isLoading, error } = useBirdImageUrls(birdId, scientificName);
  
  // Memoize cache key and styles
  const cacheKey = useMemo(() => getBirdImageCacheKey(birdId, size), [birdId, size]);
  
  const imageStyle = useMemo(() => [
    styles.image,
    { width: size, height: size },
    style
  ], [size, style]);

  const placeholderStyle = useMemo(() => [
    styles.placeholder,
    { width: size, height: size },
    style
  ], [size, style]);

  /**
   * Handles image loading errors
   */
  const handleImageError = useCallback(() => {
    onLoadEnd?.();
  }, [onLoadEnd]);

  /**
   * Handles successful image load
   */
  const handleImageLoad = useCallback(() => {
    onLoadEnd?.();
  }, [onLoadEnd]);

  // Loading state
  if (isLoading) {
    onLoadStart?.();
    return (
      <View style={placeholderStyle}>
        <Text style={[styles.placeholderText, { fontSize: size * 0.375 }]}>
          ⏳
        </Text>
        <Text style={[styles.placeholderSubText, { fontSize: size * 0.15 }]}>
          Loading
        </Text>
      </View>
    );
  }

  // Error state or no URLs
  if (error || imageUrls.length === 0) {
    return (
      <View style={placeholderStyle}>
        <Text style={[styles.placeholderText, { fontSize: size * 0.375 }]}>
          🐦
        </Text>
        <Text style={[styles.placeholderSubText, { fontSize: size * 0.15 }]}>
          No Image
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={imageUrls.map(url => ({ uri: url }))}
      style={imageStyle}
      onError={handleImageError}
      onLoad={handleImageLoad}
      placeholder="🐦"
      transition={200}
      contentFit="contain"
      // Optimized caching configuration
      cachePolicy="memory-disk"
      priority={priority}
      recyclingKey={cacheKey}
      // Performance optimizations
      allowDownscaling={true}
      autoplay={false}
    />
  );
});

BirdImage.displayName = 'BirdImage';

const styles = StyleSheet.create({
  image: {
    backgroundColor: Platform.OS === 'android' ? Colors.light.surfaceAlt : '#ffffff',
    borderRadius: 8,
    borderWidth: Platform.OS === 'android' ? 1.5 : 1,
    borderColor: Platform.OS === 'android' ? Colors.light.border : '#e9ecef',
    overflow: 'hidden',
    // Add subtle shadow for better definition on Android only
    ...Platform.select({
      android: {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      ios: {
        // Keep original iOS styling
      }
    }),
  },
  placeholder: {
    backgroundColor: Platform.OS === 'android' ? Colors.light.surfaceAlt : '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Platform.OS === 'android' ? 1.5 : 1,
    borderColor: Platform.OS === 'android' ? Colors.light.border : '#e9ecef',
    overflow: 'hidden',
    // Add subtle shadow for better definition on Android only
    ...Platform.select({
      android: {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      ios: {
        // Keep original iOS styling
      }
    }),
  },
  placeholderText: {
    color: Platform.OS === 'android' ? Colors.light.textMuted : '#6c757d',
  },
  placeholderSubText: {
    color: Platform.OS === 'android' ? Colors.light.textMuted : '#adb5bd',
    marginTop: 2,
    opacity: Platform.OS === 'android' ? 0.7 : 1,
  },
}); 