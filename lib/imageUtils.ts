import { supabase } from './supabaseClient';

/**
 * Cached signed URL with TTL
 */
interface CachedSignedUrl {
  url: string;
  expiresAt: number;
}

/**
 * In-memory cache for signed URLs with TTL management
 */
class SignedUrlCache {
  private cache = new Map<string, CachedSignedUrl>();
  private readonly TTL_MS = 50 * 60 * 1000; // 50 minutes (10min buffer before 1hr expiry)

  /**
   * Gets cached URL if still valid
   */
  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.url;
  }

  /**
   * Sets URL in cache with TTL
   */
  set(key: string, url: string): void {
    this.cache.set(key, {
      url,
      expiresAt: Date.now() + this.TTL_MS
    });
  }

  /**
   * Clears expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Gets cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
const urlCache = new SignedUrlCache();

// Cleanup expired URLs every 10 minutes
setInterval(() => urlCache.cleanup(), 10 * 60 * 1000);

/**
 * Performance monitoring for cache effectiveness
 */
class PerformanceMonitor {
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalRequests = 0;
  private averageLoadTime = 0;

  recordCacheHit() {
    this.cacheHits++;
    this.totalRequests++;
  }

  recordCacheMiss() {
    this.cacheMisses++;
    this.totalRequests++;
  }

  recordLoadTime(timeMs: number) {
    this.averageLoadTime = (this.averageLoadTime + timeMs) / 2;
  }

  getStats() {
    const hitRate = this.totalRequests > 0 ? (this.cacheHits / this.totalRequests) * 100 : 0;
    return {
      cacheHitRate: hitRate.toFixed(1) + '%',
      totalRequests: this.totalRequests,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      averageLoadTime: this.averageLoadTime.toFixed(0) + 'ms'
    };
  }

  reset() {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalRequests = 0;
    this.averageLoadTime = 0;
  }
}

// Global performance monitor
const performanceMonitor = new PerformanceMonitor();

/**
 * Generates signed URLs for private bucket access with caching and performance monitoring
 * @param birdId - Bird ID
 * @param scientificName - Bird's scientific name
 * @returns Array of signed URLs with 1 hour expiry
 */
export const generateBirdImageUrls = async (birdId: string, scientificName?: string | null): Promise<string[]> => {
  const startTime = Date.now();
  const urls: string[] = [];
  
  try {
    const filenames: string[] = [];
    
    if (scientificName) {
      // Primary format: {id}-{scientific-name-with-dashes}.jpeg
      const nameWithDashes = scientificName.trim().replace(/\s+/g, '-');
      filenames.push(`${birdId}-${nameWithDashes}.jpeg`);
      filenames.push(`${birdId}-${nameWithDashes}.jpg`);
    }
    
    // Fallback formats
    filenames.push(`${birdId}.jpeg`);
    filenames.push(`${birdId}.jpg`);
    
    // Check cache first, then generate URLs for uncached files
    const uncachedFilenames: string[] = [];
    
    for (const filename of filenames) {
      const cacheKey = `bird-images/${filename}`;
      const cachedUrl = urlCache.get(cacheKey);
      
      if (cachedUrl) {
        urls.push(cachedUrl);
        performanceMonitor.recordCacheHit();
      } else {
        uncachedFilenames.push(filename);
        performanceMonitor.recordCacheMiss();
      }
    }
    
    // Generate signed URLs for uncached files
    if (uncachedFilenames.length > 0) {
      const signedUrlPromises = uncachedFilenames.map(async (filename) => {
        const { data, error } = await supabase.storage
          .from('qustar-images')
          .createSignedUrl(`bird-images/${filename}`, 3600);
        
        if (data?.signedUrl && !error) {
          const cacheKey = `bird-images/${filename}`;
          urlCache.set(cacheKey, data.signedUrl);
          return data.signedUrl;
        }
        return null;
      });
      
      const newUrls = await Promise.all(signedUrlPromises);
      urls.push(...newUrls.filter((url): url is string => url !== null));
    }
    
  } catch (error) {
    console.error('🖼️ Error generating signed URLs:', error);
  } finally {
    const loadTime = Date.now() - startTime;
    performanceMonitor.recordLoadTime(loadTime);
  }
  
  return urls;
};

/**
 * Batch generates signed URLs for multiple birds efficiently
 * @param birds - Array of bird objects with id and scientific_name
 * @returns Map of birdId to signed URLs
 */
export const batchGenerateBirdImageUrls = async (
  birds: Array<{ id: string; scientific_name?: string | null }>
): Promise<Map<string, string[]>> => {
  const results = new Map<string, string[]>();
  const batchSize = 10; // Process in smaller batches to avoid overwhelming Supabase
  
  for (let i = 0; i < birds.length; i += batchSize) {
    const batch = birds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (bird) => {
      const urls = await generateBirdImageUrls(bird.id, bird.scientific_name);
      return { birdId: bird.id, urls };
    });
    
    try {
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ birdId, urls }) => {
        results.set(birdId, urls);
      });
      
      // Small delay between batches to be nice to Supabase
      if (i + batchSize < birds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('🖼️ Error in batch URL generation:', error);
    }
  }
  
  return results;
};

/**
 * Gets the primary signed URL for a bird with caching
 * @param birdId - Bird ID
 * @param scientificName - Bird's scientific name
 * @returns Promise<string> - Primary signed URL
 */
export const getPrimaryBirdImageUrl = async (birdId: string, scientificName?: string | null): Promise<string> => {
  const urls = await generateBirdImageUrls(birdId, scientificName);
  return urls[0] || '';
};

/**
 * Configuration for image size optimization
 */
export const IMAGE_SIZES = {
  THUMBNAIL: 64,
  GRID: 120,
  DETAIL: 300,
  FULL: 800,
} as const;

/**
 * Gets optimized image cache key for a bird image
 * @param birdId - Bird ID
 * @param size - Image size
 * @returns Cache key string
 */
export const getBirdImageCacheKey = (birdId: string, size: number): string => {
  return `bird-${birdId}-${size}`;
};

/**
 * Gets comprehensive performance and cache statistics
 */
export const getComprehensiveStats = () => {
  return {
    signedUrlCache: urlCache.getStats(),
    performance: performanceMonitor.getStats()
  };
};

/**
 * Generates signed URLs for bird migration/habitat maps with caching
 * @param birdId - Bird ID (should be numeric for map naming)
 * @param scientificName - Bird's scientific name
 * @returns Promise<string | null> - Signed URL for map or null if not found
 */
export const generateBirdMapUrl = async (birdId: string, scientificName?: string | null): Promise<string | null> => {
  const startTime = Date.now();
  
  try {
    // Extract numeric ID from birdId (handle both string numbers and other formats)
    let numericId: string;
    
    if (/^\d+$/.test(birdId)) {
      // If birdId is already numeric, use it directly
      numericId = birdId;
    } else {
      // Try to extract numbers from the ID (e.g., "bird-123" -> "123")
      const numberMatch = birdId.match(/\d+/);
      if (numberMatch) {
        numericId = numberMatch[0];
      } else {
        // If no numbers found, try using the first few characters as a fallback
        console.warn('🗺️ Non-numeric bird ID for map, using fallback:', birdId);
        return null;
      }
    }
    
    // Generate map filename prioritizing .jpeg since that's what exists in storage
    const filesToTry: string[] = [];
    
    if (scientificName) {
      const nameWithDashes = scientificName.trim().replace(/\s+/g, '-');
      // Try .jpeg first (what actually exists), then .jpg as fallback
      filesToTry.push(`${numericId}-${nameWithDashes}-map.jpeg`);
      filesToTry.push(`${numericId}-${nameWithDashes}-map.jpg`);
    }
    
    // Fallback formats without scientific name
    filesToTry.push(`${numericId}-map.jpeg`);
    filesToTry.push(`${numericId}-map.jpg`);
    
    // Try each filename until we find one that works
    for (const filename of filesToTry) {
      const cacheKey = `bird-maps-images/${filename}`;
      
      // Check cache first
      const cachedUrl = urlCache.get(cacheKey);
      if (cachedUrl) {
        performanceMonitor.recordCacheHit();
        return cachedUrl;
      }
      
      performanceMonitor.recordCacheMiss();
      
      // Try to generate signed URL for this filename
      const { data, error } = await supabase.storage
        .from('qustar-images')
        .createSignedUrl(`bird-maps-images/${filename}`, 3600);
      
      if (data?.signedUrl && !error) {
        urlCache.set(cacheKey, data.signedUrl);
        console.log(`🗺️ Found map: ${filename}`);
        return data.signedUrl;
      }
    }
    
    console.log(`🗺️ No map found for bird ${numericId} (${scientificName})`);
    return null;
    
  } catch (error) {
    console.error('🗺️ Error generating map URL:', error);
    return null;
  } finally {
    const loadTime = Date.now() - startTime;
    performanceMonitor.recordLoadTime(loadTime);
  }
};

/**
 * React Query compatible function for bird map URLs
 * @param birdId - Bird ID
 * @param scientificName - Scientific name for URL generation
 * @returns Promise<string | null> - Map URL or null
 */
export const fetchBirdMapUrl = async (birdId: string, scientificName?: string | null): Promise<string | null> => {
  return generateBirdMapUrl(birdId, scientificName);
}; 