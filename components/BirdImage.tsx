import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BirdImageProps {
  birdId: string;
  scientificName?: string | null;
  size?: number;
  style?: any;
}

/**
 * Bird image component with automatic fallback to placeholder
 * Loads bird image from Supabase S3-compatible storage using direct URLs
 * Image format: {id}-{scientific-name-with-dashes}.jpeg
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
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const getImageUrl = () => {
      try {
        // Import supabase client for proper public URL generation
        import('../lib/supabaseClient').then(({ supabase }) => {
          // Construct filename in format: {id}-{scientific-name-with-dashes}.jpeg
          let filename;
          
          if (scientificName) {
            // Convert scientific name to dash format: "Falco peregrinus" -> "Falco-peregrinus"
            const nameWithDashes = scientificName.trim().replace(/\s+/g, '-');
            filename = `${birdId}-${nameWithDashes}.jpeg`;
          } else {
            // Fallback to just ID if no scientific name
            filename = `${birdId}.jpeg`;
          }
          
          // Use Supabase public URL method (more reliable than S3 direct)
          const { data: publicUrl } = supabase.storage
            .from('qustar-images')
            .getPublicUrl(`bird-images/${filename}`);
          
          console.log('🖼️ Generating public image URL for bird:', { birdId, scientificName, filename });
          console.log('🖼️ Public Image URL generated:', publicUrl.publicUrl);
          
          setImageUrl(publicUrl.publicUrl);
          
          // Test if image actually exists
          fetch(publicUrl.publicUrl, { method: 'HEAD' })
            .then(response => {
              if (!response.ok) {
                console.log('🖼️ Primary image does not exist, trying fallback:', publicUrl.publicUrl);
                
                // Try alternative filename format if first attempt fails
                const fallbackFilename = `${birdId}.jpg`;
                const { data: fallbackUrl } = supabase.storage
                  .from('qustar-images')
                  .getPublicUrl(`bird-images/${fallbackFilename}`);
                
                return fetch(fallbackUrl.publicUrl, { method: 'HEAD' })
                  .then(fallbackResponse => {
                    if (fallbackResponse.ok) {
                      console.log('🖼️ Fallback image found:', fallbackUrl.publicUrl);
                      setImageUrl(fallbackUrl.publicUrl);
                    } else {
                      console.log('🖼️ No image found with either format');
                      setImageError(true);
                    }
                  });
              } else {
                console.log('🖼️ Image found successfully:', publicUrl.publicUrl);
              }
            })
            .catch(err => {
              console.log('🖼️ Error checking image existence:', err);
              setImageError(true);
            });
        });
        
      } catch (error) {
        console.error('🖼️ Error generating image URL:', error);
        setImageError(true);
      }
    };
    
    if (birdId) {
      getImageUrl();
    }
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
   * Handles image loading errors by showing placeholder
   */
  const handleImageError = (error: any) => {
    console.log('🖼️ S3 Image failed to load:', error);
    setImageError(true);
  };

  // Show placeholder if image failed to load, on error, or no URL
  if (imageError || !imageUrl) {
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
      source={{ uri: imageUrl }}
      style={imageStyle}
      onError={handleImageError}
      placeholder="🐦"
      transition={200}
      contentFit="contain"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  placeholder: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#666',
  },
  placeholderSubText: {
    color: '#999',
    marginTop: 2,
  },
}); 