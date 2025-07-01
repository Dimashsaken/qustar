import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  placeholderText: {
    color: '#6c757d',
  },
  placeholderSubText: {
    color: '#adb5bd',
    marginTop: 2,
  },
}); 