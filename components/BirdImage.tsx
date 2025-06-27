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
        // Base S3 URL for Supabase storage
        const baseS3Url = 'https://odmfmyrdaisfboswcidq.supabase.co/storage/v1/s3/qustar-images/bird-images';
        
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
        
        const fullUrl = `${baseS3Url}/${filename}`;
        
        console.log('🖼️ Generating S3 image URL for bird:', { birdId, scientificName, filename });
        console.log('🖼️ S3 Image URL generated:', fullUrl);
        
        setImageUrl(fullUrl);
        
        // Test if image actually exists
        fetch(fullUrl, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              console.log('🖼️ S3 Image does not exist at URL, trying fallback:', fullUrl);
              
              // Try alternative filename format if first attempt fails
              const fallbackFilename = `${birdId}.jpg`;
              const fallbackUrl = `${baseS3Url}/${fallbackFilename}`;
              
              return fetch(fallbackUrl, { method: 'HEAD' })
                .then(fallbackResponse => {
                  if (fallbackResponse.ok) {
                    console.log('🖼️ S3 Fallback image found:', fallbackUrl);
                    setImageUrl(fallbackUrl);
                  } else {
                    console.log('🖼️ No S3 image found with either format');
                    setImageError(true);
                  }
                });
            } else {
              console.log('🖼️ S3 Image found successfully:', fullUrl);
            }
          })
          .catch(err => {
            console.log('🖼️ Error checking S3 image existence:', err);
            setImageError(true);
          });
        
      } catch (error) {
        console.error('🖼️ Error generating S3 image URL:', error);
        setImageError(true);
      }
    };
    
    if (birdId) {
      getImageUrl();
    }
  }, [birdId, scientificName]);
  
  const imageStyle = [
    styles.image,
    { width: size, height: size, borderRadius: size / 2 },
    style
  ];

  const placeholderStyle = [
    styles.placeholder,
    { width: size, height: size, borderRadius: size / 2 },
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
      contentFit="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
  },
}); 