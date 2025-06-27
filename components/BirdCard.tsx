import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BirdListItem } from '../types/bird';
import { BirdImage } from './BirdImage';

interface BirdCardProps {
  bird: BirdListItem;
  onPress?: () => void;
}

/**
 * Bird card component for list view display
 * Shows essential bird information with navigation to detail screen
 * @param bird - Bird data to display
 * @param onPress - Optional custom press handler
 * @returns JSX.Element - Pressable bird card component
 */
export const BirdCard: React.FC<BirdCardProps> = ({ bird, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/bird/${bird.id}`);
    }
  };

  const displayName = bird.common_name_en || bird.scientific_name || 'Unknown Bird';
  const kazakhName = bird.common_name_kz;
  const family = bird.family;
  const size = bird.size;
  const colors = bird.primary_colors;
  const status = bird.status_kz;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <BirdImage 
            birdId={bird.id} 
            scientificName={bird.scientific_name}
            size={64} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.primaryName} numberOfLines={1}>
            {displayName}
          </Text>
          
          {kazakhName && (
            <Text style={styles.kazakhName} numberOfLines={1}>
              {kazakhName}
            </Text>
          )}
          
          <View style={styles.metadataRow}>
            {family && (
              <Text style={styles.metadata} numberOfLines={1}>
                {family}
              </Text>
            )}
            {size && (
              <Text style={[styles.metadata, styles.size]} numberOfLines={1}>
                {size}
              </Text>
            )}
          </View>
          
          {(colors || status) && (
            <View style={styles.tagsRow}>
              {colors && (
                <Text style={styles.tag} numberOfLines={1}>
                  {colors}
                </Text>
              )}
              {status && (
                <Text style={[styles.tag, styles.statusTag]} numberOfLines={1}>
                  {status}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  primaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  kazakhName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  size: {
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 10,
    backgroundColor: '#e8f4fd',
    color: '#0066cc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginTop: 2,
  },
  statusTag: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
}); 