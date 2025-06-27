import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BirdListItem } from '../types/bird';
import { BirdImage } from './BirdImage';

interface BirdCardProps {
  bird: BirdListItem;
  variant?: 'list' | 'grid';
  onPress?: () => void;
}

// Get screen dimensions for grid calculations
const { width: screenWidth } = Dimensions.get('window');
const gridItemWidth = (screenWidth - 24) / 2 - 4; // Reduced margins for bigger cards

/**
 * Bird card component for list or grid view display
 * Shows essential bird information with navigation to detail screen
 * @param bird - Bird data to display
 * @param variant - Display variant: 'list' or 'grid'
 * @param onPress - Optional custom press handler
 * @returns JSX.Element - Pressable bird card component
 */
export const BirdCard: React.FC<BirdCardProps> = ({ bird, variant = 'list', onPress }) => {
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

  const isGrid = variant === 'grid';
  const containerStyle = isGrid ? [styles.container, styles.gridContainer] : styles.container;
  const contentStyle = isGrid ? styles.gridContent : styles.listContent;
  const imageSize = isGrid ? 120 : 64; // Much larger image for grid

  return (
    <Pressable style={containerStyle} onPress={handlePress}>
      <View style={contentStyle}>
        <View style={isGrid ? styles.gridImageContainer : styles.imageContainer}>
          <BirdImage 
            birdId={bird.id} 
            scientificName={bird.scientific_name}
            size={imageSize} 
          />
        </View>
        
        <View style={isGrid ? styles.gridTextContainer : styles.textContainer}>
          <Text style={styles.primaryName} numberOfLines={isGrid ? 2 : 1}>
            {displayName}
          </Text>
          
          {kazakhName && (
            <Text style={styles.kazakhName} numberOfLines={1}>
              {kazakhName}
            </Text>
          )}
          
          {!isGrid && (
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
          )}
          
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
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridContainer: {
    width: gridItemWidth,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  listContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  gridContent: {
    flexDirection: 'column',
    padding: 16,
    alignItems: 'center',
    minHeight: 240, // Taller to accommodate larger image
  },
  imageContainer: {
    marginRight: 12,
  },
  gridImageContainer: {
    marginRight: 0,
  },
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  primaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  kazakhName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
    textAlign: 'center',
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
    justifyContent: 'center',
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