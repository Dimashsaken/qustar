import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { generateBirdImageUrls, getBirdImageCacheKey } from '../lib/imageUtils';

interface BirdImageProps {
  birdId: string;
  scientificName?: string | null;
  size?: number;
  style?: any;
}

/**
 * Bird image component with automatic fallback to placeholder
 * Loads bird image from Supabase S3-compatible storage using direct URLs
 * Features optimized caching and reduced network requests for better performance
 * @param birdId - Bird ID for image lookup
 * @param scientificName - Scientific name for constructing filename
 * @param size - Image dimensions (default: 64)
 * @param style - Additional styles
 * @returns JSX.Element - Image component with fallback
 */
export const BirdImage: React.FC<BirdImageProps> = ({ 
  birdId, 
  scientificName,
  size = 64, 
  style 
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  
  useEffect(() => {
    const urls = generateBirdImageUrls(birdId, scientificName);
    setImageUrls(urls);
    setShowPlaceholder(false);
  }, [birdId, scientificName]);
  
  const imageStyle = [
    styles.image,
    { width: size, height: size },
    style
  ];

  const placeholderStyle = [
    styles.placeholder,
    { width: size, height: size },
    style
  ];

  /**
   * Handles image loading errors by trying next URL or showing placeholder
   */
  const handleImageError = () => {
    setShowPlaceholder(true);
  };

  // Show placeholder if no URLs generated or error occurred
  if (showPlaceholder || imageUrls.length === 0) {
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

  // Generate cache key for consistent caching
  const cacheKey = getBirdImageCacheKey(birdId, size);

  return (
    <Image
      source={imageUrls.map(url => ({ uri: url }))}
      style={imageStyle}
      onError={handleImageError}
      placeholder="🐦"
      transition={200}
      contentFit="contain"
      // Optimized caching configuration
      cachePolicy="disk"
      priority="normal"
      // Reduce memory usage for list items
      recyclingKey={cacheKey}
    />
  );
};

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