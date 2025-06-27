import { supabase } from './supabaseClient';

/**
 * Generates possible image URLs for a bird
 * Returns multiple URLs to try in order of preference
 * @param birdId - Bird ID
 * @param scientificName - Bird's scientific name
 * @returns Array of possible image URLs
 */
export const generateBirdImageUrls = (birdId: string, scientificName?: string | null): string[] => {
  const urls: string[] = [];
  
  try {
    if (scientificName) {
      // Primary format: {id}-{scientific-name-with-dashes}.jpeg
      const nameWithDashes = scientificName.trim().replace(/\s+/g, '-');
      const primaryFilename = `${birdId}-${nameWithDashes}.jpeg`;
      const { data: primaryUrl } = supabase.storage
        .from('qustar-images')
        .getPublicUrl(`bird-images/${primaryFilename}`);
      urls.push(primaryUrl.publicUrl);
      
      // Alternative format: {id}-{scientific-name-with-dashes}.jpg
      const altFilename = `${birdId}-${nameWithDashes}.jpg`;
      const { data: altUrl } = supabase.storage
        .from('qustar-images')
        .getPublicUrl(`bird-images/${altFilename}`);
      urls.push(altUrl.publicUrl);
    }
    
    // Fallback formats
    const fallbackJpeg = `${birdId}.jpeg`;
    const fallbackJpg = `${birdId}.jpg`;
    
    const { data: fallbackUrl1 } = supabase.storage
      .from('qustar-images')
      .getPublicUrl(`bird-images/${fallbackJpeg}`);
    urls.push(fallbackUrl1.publicUrl);
    
    const { data: fallbackUrl2 } = supabase.storage
      .from('qustar-images')
      .getPublicUrl(`bird-images/${fallbackJpg}`);
    urls.push(fallbackUrl2.publicUrl);
    
  } catch (error) {
    console.error('🖼️ Error generating image URLs:', error);
  }
  
  return urls;
};

/**
 * Gets the primary image URL for a bird (for preloading)
 * @param birdId - Bird ID
 * @param scientificName - Bird's scientific name
 * @returns Primary image URL
 */
export const getPrimaryBirdImageUrl = (birdId: string, scientificName?: string | null): string => {
  const urls = generateBirdImageUrls(birdId, scientificName);
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