import { Image } from 'expo-image';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Configuration for image cache management
 */
interface ImageCacheConfig {
  maxCacheSize?: number; // MB
  maxCacheAge?: number; // seconds
  enablePreloading?: boolean;
}

/**
 * Priority levels for image preloading
 */
export enum PreloadPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

/**
 * Hook for managing image cache and preloading with optimized performance
 * @param config - Cache configuration options
 */
export const useImageCache = (config: ImageCacheConfig = {}) => {
  const { 
    maxCacheSize = 200, 
    maxCacheAge = 7200, // 2 hours default
    enablePreloading = true 
  } = config;
  
  const preloadingRef = useRef(new Set<string>());
  const preloadQueueRef = useRef<Array<{url: string, priority: PreloadPriority}>>([]);
  const isProcessingRef = useRef(false);

  /**
   * Processes the preload queue with priority-based batching
   */
  const processPreloadQueue = useCallback(async () => {
    if (isProcessingRef.current || preloadQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    
    try {
      // Sort by priority: HIGH -> NORMAL -> LOW
      const queue = [...preloadQueueRef.current].sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      preloadQueueRef.current = [];

      // Process in batches of 5 to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < queue.length; i += batchSize) {
        const batch = queue.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ url, priority }) => {
          if (preloadingRef.current.has(url)) return false;
          
          preloadingRef.current.add(url);
          
                     try {
             const result = await Image.prefetch(url);
             return result;
          } catch (error) {
            console.warn(`⚠️ Failed to preload image (${priority}):`, url, error);
            return false;
          } finally {
            preloadingRef.current.delete(url);
          }
        });

        await Promise.allSettled(batchPromises);
        
        // Add small delay between batches for better performance
        if (i + batchSize < queue.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`🖼️ Processed ${queue.length} images in preload queue`);
    } catch (error) {
      console.warn('⚠️ Error processing preload queue:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enablePreloading) return;

    // Process queue every 500ms
    const interval = setInterval(processPreloadQueue, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [processPreloadQueue, enablePreloading]);

  /**
   * Adds images to preload queue with priority
   * @param urls - Array of image URLs to preload
   * @param priority - Preload priority level
   */
  const queuePreloadImages = useCallback((urls: string[], priority: PreloadPriority = PreloadPriority.NORMAL) => {
    if (!enablePreloading || urls.length === 0) return;

    const newItems = urls
      .filter(url => url && url.length > 0)
      .filter(url => !preloadingRef.current.has(url))
      .map(url => ({ url, priority }));

    preloadQueueRef.current.push(...newItems);
    
    // Process immediately for high priority items
    if (priority === PreloadPriority.HIGH) {
      setTimeout(processPreloadQueue, 0);
    }
  }, [enablePreloading, processPreloadQueue]);

  /**
   * Preloads images immediately (legacy method for compatibility)
   * @param urls - Array of image URLs to preload
   */
  const preloadImages = useCallback(async (urls: string[]) => {
    queuePreloadImages(urls, PreloadPriority.HIGH);
  }, [queuePreloadImages]);

  /**
   * Preloads images with smart batching and priority
   * @param urls - Array of image URLs to preload
   * @param priority - Priority level for preloading
   * @param maxCount - Maximum number of images to preload
   */
  const smartPreload = useCallback((
    urls: string[], 
    priority: PreloadPriority = PreloadPriority.NORMAL,
    maxCount: number = 50
  ) => {
    const filteredUrls = urls
      .filter(url => url && url.length > 0)
      .slice(0, maxCount);
    
    queuePreloadImages(filteredUrls, priority);
  }, [queuePreloadImages]);

  /**
   * Clears image cache to free up memory (use sparingly)
   */
  const clearCache = useCallback(async () => {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
      preloadingRef.current.clear();
      preloadQueueRef.current = [];
      console.log('🧹 Image cache cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear image cache:', error);
    }
  }, []);

  /**
   * Gets current cache status and statistics
   */
  const getCacheInfo = useCallback(async () => {
    try {
      return {
        preloadingCount: preloadingRef.current.size,
        queuedCount: preloadQueueRef.current.length,
        isProcessing: isProcessingRef.current,
        config: { maxCacheSize, maxCacheAge, enablePreloading }
      };
    } catch (error) {
      console.warn('⚠️ Could not get cache info:', error);
      return null;
    }
  }, [maxCacheSize, maxCacheAge, enablePreloading]);

  /**
   * Optimizes cache by removing old/unused images
   */
  const optimizeCache = useCallback(async () => {
    try {
      // Clear only memory cache to free up RAM while keeping disk cache
      await Image.clearMemoryCache();
      console.log('🔧 Cache optimized - memory cleared, disk cache preserved');
    } catch (error) {
      console.warn('⚠️ Failed to optimize cache:', error);
    }
  }, []);

  return {
    preloadImages, // Legacy compatibility
    smartPreload,
    queuePreloadImages,
    clearCache,
    optimizeCache,
    getCacheInfo,
    PreloadPriority
  };
}; 