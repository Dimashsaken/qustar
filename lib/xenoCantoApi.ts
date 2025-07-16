/**
 * Xeno Canto API client for bird sound recordings
 * Official API documentation: https://xeno-canto.org/explore/api
 */

/**
 * Xeno Canto API response interface
 */
export interface XenoCantoResponse {
  numRecordings: string;
  numSpecies: string;
  page: number;
  numPages: number;
  recordings: XenoCantoRecording[];
}

/**
 * Individual recording interface
 */
export interface XenoCantoRecording {
  id: string;
  gen: string; // Genus
  sp: string; // Species
  ssp: string; // Subspecies
  en: string; // English name
  rec: string; // Recorder
  cnt: string; // Country
  loc: string; // Location
  lat: string; // Latitude
  lng: string; // Longitude
  alt: string; // Altitude
  type: string; // Recording type
  sex: string; // Sex
  stage: string; // Life stage
  method: string; // Recording method
  url: string; // Recording URL
  file: string; // Direct file URL
  file_name: string; // File name
  sono: {
    small: string; // Small spectrogram
    med: string; // Medium spectrogram
    large: string; // Large spectrogram
    full: string; // Full spectrogram
  };
  lic: string; // License
  q: string; // Quality rating
  length: string; // Recording length
  time: string; // Time of recording
  date: string; // Date of recording
  uploaded: string; // Upload date
  also: string[]; // Other species heard
  rmk: string; // Remarks
  bird_seen: string; // Bird seen
  animal_seen: string; // Animal seen
  playback_used: string; // Playback used
  temp: string; // Temperature
  regnr: string; // Registration number
  auto: string; // Auto identification
  dvc: string; // Device used
  mic: string; // Microphone used
  smp: string; // Sample rate
}

/**
 * Search options for Xeno Canto API
 */
export interface XenoCantoSearchOptions {
  query: string; // Required search query
  page?: number; // Optional page number
}

/**
 * Search result for simplified usage
 */
export interface XenoCantoBirdSound {
  id: string;
  url: string;
  fileUrl: string;
  quality: string;
  length: string;
  location: string;
  country: string;
  recordedBy: string;
  date: string;
  speciesName: string;
  englishName: string;
}

/**
 * Xeno Canto API client
 */
export class XenoCantoApi {
  private static readonly BASE_URL = 'https://xeno-canto.org/api/2/recordings';
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  
  private static lastRequestTime = 0;

  /**
   * Enforces rate limiting by waiting if necessary
   */
  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Normalize scientific name for better matching
   * @param scientificName - Original scientific name
   * @returns Normalized scientific name
   */
  private static normalizeScientificName(scientificName: string): string {
    return scientificName
      .trim()
      .toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .slice(0, 2) // Keep only genus and species
      .join(' ');
  }

  /**
   * Generate search variations for a scientific name
   * @param scientificName - Original scientific name
   * @returns Array of search variations
   */
  private static generateSearchVariations(scientificName: string): string[] {
    const variations: string[] = [];
    const normalized = this.normalizeScientificName(scientificName);
    const parts = normalized.split(' ');
    
    if (parts.length >= 2) {
      const [genus, species] = parts;
      
      // Add original normalized name
      variations.push(normalized);
      
      // Add genus only search
      variations.push(genus);
      
      // Add species only search
      variations.push(species);
      
      // Add partial matches
      if (genus.length > 3) {
        variations.push(`${genus.slice(0, -1)}*`); // Partial genus
      }
      if (species.length > 3) {
        variations.push(`${species.slice(0, -1)}*`); // Partial species
      }
    }
    
    return variations;
  }

  /**
   * Search for bird recordings by species name with improved matching
   * @param scientificName - Scientific name of the bird (e.g., "Turdus migratorius")
   * @param options - Additional search options
   * @returns Promise<XenoCantoBirdSound[]> - Array of bird sounds
   */
  static async searchBySpecies(
    scientificName: string,
    options: Partial<XenoCantoSearchOptions> = {}
  ): Promise<XenoCantoBirdSound[]> {
    await this.enforceRateLimit();

    const searchVariations = this.generateSearchVariations(scientificName);
    console.log('Searching for bird sounds with variations:', searchVariations);
    
    // Try each variation until we find results
    for (const variation of searchVariations) {
      try {
        const { page = 1 } = options;
        const query = encodeURIComponent(variation);
        const url = `${this.BASE_URL}?query=${query}&page=${page}`;

        console.log('Trying search query:', variation);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'QuStar-BirdApp/1.0',
          },
        });

        if (!response.ok) {
          console.warn(`HTTP error for query "${variation}": ${response.status}`);
          continue; // Try next variation
        }

        const data: XenoCantoResponse = await response.json();
        
        if (data.recordings && data.recordings.length > 0) {
          console.log(`Found ${data.recordings.length} recordings for query "${variation}"`);
          
          // Convert to simplified format and filter for quality
          const results = data.recordings
            .filter(recording => {
              // Filter for quality and valid file URLs
              const hasValidQuality = recording.q && ['A', 'B', 'C', 'D'].includes(recording.q);
              const hasValidFileUrl = recording.file && recording.file.startsWith('http');
              return hasValidQuality && hasValidFileUrl;
            })
            .slice(0, 5) // Limit to first 5 results
            .map(recording => ({
              id: recording.id,
              url: recording.url,
              fileUrl: recording.file.replace('http:', 'https:'), // Force HTTPS
              quality: recording.q,
              length: recording.length,
              location: recording.loc,
              country: recording.cnt,
              recordedBy: recording.rec,
              date: recording.date,
              speciesName: `${recording.gen} ${recording.sp}`,
              englishName: recording.en,
            }));
          
          if (results.length > 0) {
            return results;
          }
        }
        
        // Add small delay between variation attempts
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`Error searching with variation "${variation}":`, error);
        continue; // Try next variation
      }
    }

    // If no variations worked, return empty array
    console.warn('No bird sounds found for any search variations of:', scientificName);
    return [];
  }

  /**
   * Generate search variations for a common name
   * @param commonName - Original common name
   * @returns Array of search variations
   */
  private static generateCommonNameVariations(commonName: string): string[] {
    const variations: string[] = [];
    const normalized = commonName.trim().toLowerCase();
    
    // Add original name
    variations.push(normalized);
    
    // Try without common words that might cause issues
    const wordsToRemove = ['common', 'european', 'american', 'asian', 'african', 'northern', 'southern', 'eastern', 'western'];
    let cleanedName = normalized;
    wordsToRemove.forEach(word => {
      cleanedName = cleanedName.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
    });
    if (cleanedName !== normalized && cleanedName.length > 2) {
      variations.push(cleanedName);
    }
    
    // Try individual words if name has multiple words
    const words = normalized.split(' ').filter(word => word.length > 2);
    if (words.length > 1) {
      words.forEach(word => {
        variations.push(word);
      });
    }
    
    return variations.filter(v => v.length > 2); // Remove very short variations
  }

  /**
   * Search for bird recordings by common name with improved matching
   * @param commonName - Common name of the bird (e.g., "American Robin")
   * @param options - Additional search options
   * @returns Promise<XenoCantoBirdSound[]> - Array of bird sounds
   */
  static async searchByCommonName(
    commonName: string,
    options: Partial<XenoCantoSearchOptions> = {}
  ): Promise<XenoCantoBirdSound[]> {
    await this.enforceRateLimit();

    const searchVariations = this.generateCommonNameVariations(commonName);
    console.log('Searching for bird sounds by common name with variations:', searchVariations);
    
    // Try each variation until we find results
    for (const variation of searchVariations) {
      try {
        const { page = 1 } = options;
        const query = encodeURIComponent(variation);
        const url = `${this.BASE_URL}?query=${query}&page=${page}`;

        console.log('Trying common name search query:', variation);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'QuStar-BirdApp/1.0',
          },
        });

        if (!response.ok) {
          console.warn(`HTTP error for common name query "${variation}": ${response.status}`);
          continue; // Try next variation
        }

        const data: XenoCantoResponse = await response.json();
        
        if (data.recordings && data.recordings.length > 0) {
          console.log(`Found ${data.recordings.length} recordings for common name query "${variation}"`);
          
          // Convert to simplified format and filter for quality
          const results = data.recordings
            .filter(recording => {
              // Filter for quality and valid file URLs
              const hasValidQuality = recording.q && ['A', 'B', 'C', 'D'].includes(recording.q);
              const hasValidFileUrl = recording.file && recording.file.startsWith('http');
              return hasValidQuality && hasValidFileUrl;
            })
            .slice(0, 5) // Limit to first 5 results
            .map(recording => ({
              id: recording.id,
              url: recording.url,
              fileUrl: recording.file.replace('http:', 'https:'), // Force HTTPS
              quality: recording.q,
              length: recording.length,
              location: recording.loc,
              country: recording.cnt,
              recordedBy: recording.rec,
              date: recording.date,
              speciesName: `${recording.gen} ${recording.sp}`,
              englishName: recording.en,
            }));
          
          if (results.length > 0) {
            return results;
          }
        }
        
        // Add small delay between variation attempts
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`Error searching with common name variation "${variation}":`, error);
        continue; // Try next variation
      }
    }

    // If no variations worked, return empty array
    console.warn('No bird sounds found for any search variations of common name:', commonName);
    return [];
  }

  /**
   * Get high-quality recordings for a bird species
   * @param scientificName - Scientific name of the bird
   * @returns Promise<XenoCantoBirdSound[]> - Array of high-quality bird sounds
   */
  static async getHighQualityRecordings(scientificName: string): Promise<XenoCantoBirdSound[]> {
    await this.enforceRateLimit();

    try {
      const query = encodeURIComponent(`${scientificName} q:A`);
      const url = `${this.BASE_URL}?query=${query}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuStar-BirdApp/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: XenoCantoResponse = await response.json();
      
      // Convert to simplified format
      return data.recordings
        .slice(0, 3) // Limit to first 3 high-quality results
        .map(recording => ({
          id: recording.id,
          url: recording.url,
          fileUrl: recording.file,
          quality: recording.q,
          length: recording.length,
          location: recording.loc,
          country: recording.cnt,
          recordedBy: recording.rec,
          date: recording.date,
          speciesName: `${recording.gen} ${recording.sp}`,
          englishName: recording.en,
        }));
    } catch (error) {
      console.error('Xeno Canto API error:', error);
      throw new Error('Failed to fetch high-quality bird sounds');
    }
  }
}

/**
 * Default export for convenience
 */
export default XenoCantoApi;