/**
 * Species Name Mapping Utility
 * Helps resolve BirdNet species names to database entries
 * Includes common name variations and corrections
 */

// Common species mappings for BirdNet output to database entries
export const SPECIES_NAME_MAPPINGS: Record<string, string[]> = {
  // House Sparrow variations
  'House Sparrow': ['Passer domesticus', 'Домовый воробей', 'Үй торғайы'],
  'Passer domesticus': ['House Sparrow', 'Домовый воробей', 'Үй торғайы'],
  
  // Common Myna variations
  'Common Myna': ['Acridotheres tristis', 'Обыкновенная майна', 'Кәдімгі майна'],
  'Acridotheres tristis': ['Common Myna', 'Обыкновенная майна', 'Кәдімгі майна'],
  
  // Eurasian Tree Sparrow
  'Eurasian Tree Sparrow': ['Passer montanus', 'Полевой воробей', 'Далалық торғай'],
  'Passer montanus': ['Eurasian Tree Sparrow', 'Полевой воробей', 'Далалық торғай'],
  
  // Common Starling
  'Common Starling': ['Sturnus vulgaris', 'Обыкновенный скворец', 'Кәдімгі сарыұшшы'],
  'Sturnus vulgaris': ['Common Starling', 'Обыкновенный скворец', 'Кәдімгі сарыұшшы'],
  
  // Hooded Crow
  'Hooded Crow': ['Corvus cornix', 'Серая ворона', 'Сұр қарға'],
  'Corvus cornix': ['Hooded Crow', 'Серая ворона', 'Сұр қарға'],
  
  // Add more common Kazakhstan birds as needed
};

/**
 * Normalize species name for better matching
 */
export const normalizeSpeciesName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(common|european|asian|american|great|little|small|large)\b/gi, '')
    .trim();
};

/**
 * Get possible alternative names for a species
 */
export const getAlternativeNames = (speciesName: string): string[] => {
  const alternatives = new Set<string>();
  
  // Add original name
  alternatives.add(speciesName);
  
  // Check direct mappings
  if (SPECIES_NAME_MAPPINGS[speciesName]) {
    SPECIES_NAME_MAPPINGS[speciesName].forEach(alt => alternatives.add(alt));
  }
  
  // Check normalized mappings
  const normalized = normalizeSpeciesName(speciesName);
  Object.entries(SPECIES_NAME_MAPPINGS).forEach(([key, values]) => {
    if (normalizeSpeciesName(key) === normalized) {
      values.forEach(alt => alternatives.add(alt));
    }
  });
  
  return Array.from(alternatives);
};

/**
 * Parse BirdNet species format
 * Handles formats like "Common Myna_Acridotheres tristis"
 */
export const parseBirdNetSpecies = (speciesName: string): {
  commonName: string;
  scientificName: string;
  alternatives: string[];
} => {
  let commonName = '';
  let scientificName = '';
  
  if (speciesName.includes('_')) {
    const parts = speciesName.split('_');
    commonName = parts[0].trim();
    scientificName = parts[1].trim();
  } else {
    // If no underscore, try to determine if it's common or scientific
    if (speciesName.includes(' ') && /^[A-Z][a-z]+ [a-z]+/.test(speciesName)) {
      // Looks like scientific name (e.g., "Passer domesticus")
      scientificName = speciesName.trim();
    } else {
      // Treat as common name
      commonName = speciesName.trim();
    }
  }
  
  // Get alternative names
  const alternatives = new Set<string>();
  
  if (commonName) {
    getAlternativeNames(commonName).forEach(alt => alternatives.add(alt));
  }
  
  if (scientificName) {
    getAlternativeNames(scientificName).forEach(alt => alternatives.add(alt));
  }
  
  return {
    commonName,
    scientificName,
    alternatives: Array.from(alternatives),
  };
};

/**
 * Generate search terms for database lookup
 */
export const generateSearchTerms = (speciesName: string): string[] => {
  const parsed = parseBirdNetSpecies(speciesName);
  const searchTerms = new Set<string>();
  
  // Add parsed names
  if (parsed.commonName) {
    searchTerms.add(parsed.commonName);
    searchTerms.add(normalizeSpeciesName(parsed.commonName));
  }
  
  if (parsed.scientificName) {
    searchTerms.add(parsed.scientificName);
    searchTerms.add(normalizeSpeciesName(parsed.scientificName));
  }
  
  // Add alternatives
  parsed.alternatives.forEach(alt => {
    searchTerms.add(alt);
    searchTerms.add(normalizeSpeciesName(alt));
  });
  
  // Add genus-only search for scientific names
  if (parsed.scientificName) {
    const genus = parsed.scientificName.split(' ')[0];
    if (genus && genus.length > 2) {
      searchTerms.add(genus);
    }
  }
  
  return Array.from(searchTerms).filter(term => term.length > 2);
};
