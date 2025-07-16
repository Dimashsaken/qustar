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
   * Search for bird recordings by species name
   * @param scientificName - Scientific name of the bird (e.g., "Turdus migratorius")
   * @param options - Additional search options
   * @returns Promise<XenoCantoBirdSound[]> - Array of bird sounds
   */
  static async searchBySpecies(
    scientificName: string,
    options: Partial<XenoCantoSearchOptions> = {}
  ): Promise<XenoCantoBirdSound[]> {
    await this.enforceRateLimit();

    try {
      const { page = 1 } = options;
      const query = encodeURIComponent(scientificName);
      const url = `${this.BASE_URL}?query=${query}&page=${page}`;

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
      
      // Convert to simplified format and filter for quality
      return data.recordings
        .filter(recording => recording.q && ['A', 'B', 'C'].includes(recording.q))
        .slice(0, 5) // Limit to first 5 results
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
      throw new Error('Failed to fetch bird sounds');
    }
  }

  /**
   * Search for bird recordings by common name
   * @param commonName - Common name of the bird (e.g., "American Robin")
   * @param options - Additional search options
   * @returns Promise<XenoCantoBirdSound[]> - Array of bird sounds
   */
  static async searchByCommonName(
    commonName: string,
    options: Partial<XenoCantoSearchOptions> = {}
  ): Promise<XenoCantoBirdSound[]> {
    await this.enforceRateLimit();

    try {
      const { page = 1 } = options;
      const query = encodeURIComponent(commonName);
      const url = `${this.BASE_URL}?query=${query}&page=${page}`;

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
      
      // Convert to simplified format and filter for quality
      return data.recordings
        .filter(recording => recording.q && ['A', 'B', 'C'].includes(recording.q))
        .slice(0, 5) // Limit to first 5 results
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
      throw new Error('Failed to fetch bird sounds');
    }
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