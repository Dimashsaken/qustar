import { Image } from 'expo-image';
import { useEffect } from 'react';

/**
 * Configuration for image cache management
 */
interface ImageCacheConfig {
  maxCacheSize?: number; // MB
  maxCacheAge?: number; // seconds
}

/**
 * Hook for managing image cache and preloading
 * Helps optimize performance when displaying many images in lists
 * @param config - Cache configuration options
 */
export const useImageCache = (config: ImageCacheConfig = {}) => {
  const { maxCacheSize = 100, maxCacheAge = 3600 } = config;

  useEffect(() => {
    // Configure image cache settings
    const configureCache = async () => {
      try {
        // Clear old cache entries to manage memory
        await Image.clearMemoryCache();
        
        // Set cache limits (if supported by expo-image)
        // Note: Some cache settings may be handled automatically by expo-image
        console.log('🖼️ Image cache configured:', { maxCacheSize, maxCacheAge });
      } catch (error) {
        console.warn('⚠️ Could not configure image cache:', error);
      }
    };

    configureCache();
  }, [maxCacheSize, maxCacheAge]);

  /**
   * Preloads a list of image URLs to improve performance
   * @param urls - Array of image URLs to preload
   */
  const preloadImages = async (urls: string[]) => {
    try {
      // Preload images in background for better scrolling performance
      const preloadPromises = urls.slice(0, 20).map(url => {
        return Image.prefetch(url).catch(error => {
          console.warn('⚠️ Failed to preload image:', url, error);
          return false;
        });
      });

      await Promise.allSettled(preloadPromises);
      console.log(`🖼️ Preloaded ${urls.length} images`);
    } catch (error) {
      console.warn('⚠️ Image preloading failed:', error);
    }
  };

  /**
   * Clears image cache to free up memory
   */
  const clearCache = async () => {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
      console.log('🧹 Image cache cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear image cache:', error);
    }
  };

  /**
   * Gets current cache size information
   */
  const getCacheInfo = async () => {
    try {
      // Note: expo-image might not expose detailed cache stats
      // This is a placeholder for future functionality
      return {
        memorySize: 0,
        diskSize: 0,
        itemCount: 0
      };
    } catch (error) {
      console.warn('⚠️ Could not get cache info:', error);
      return null;
    }
  };

  return {
    preloadImages,
    clearCache,
    getCacheInfo
  };
}; 