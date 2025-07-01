import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useBirdMapUrl } from '../hooks/useBirds';
import { MapLegend } from './MapLegend';
import { ThemedText } from './ThemedText';

interface BirdMapProps {
  birdId: string;
  scientificName?: string;
  style?: any;
}

/**
 * Component for displaying bird migration/habitat maps with tap-to-expand
 * @param birdId - Bird ID for map lookup
 * @param scientificName - Scientific name for constructing filename
 * @param style - Additional styles
 * @returns JSX.Element - Map component with loading/error states
 */
export const BirdMap: React.FC<BirdMapProps> = React.memo(({ 
  birdId, 
  scientificName,
  style
}) => {
  const { data: mapUrl, isLoading, error } = useBirdMapUrl(birdId, scientificName);
  const [showLegend, setShowLegend] = useState(false);

  /**
   * Handles tap to open full-screen map
   */
  const handleMapPress = () => {
    if (mapUrl) {
      router.push(`/map/${birdId}` as any);
    }
  };

  /**
   * Handles help button press to show legend
   */
  const handleShowLegend = (e: any) => {
    e.stopPropagation(); // Prevent map navigation
    setShowLegend(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🗺️</Text>
          <ThemedText type="default" style={styles.loadingText}>
            Загрузка карты...
          </ThemedText>
        </View>
      </View>
    );
  }

  // Error or no map available
  if (error || !mapUrl) {
    return (
      <View style={[styles.container, styles.noMapContainer, style]}>
        <Text style={styles.noMapIcon}>📍</Text>
        <ThemedText type="default" style={styles.noMapText}>
          Карта недоступна
        </ThemedText>
      </View>
    );
  }

  // Map available - show preview with tap to expand
  return (
    <>
      <Pressable style={[styles.container, style]} onPress={handleMapPress}>
        <Image 
          source={{ uri: mapUrl }}
          style={styles.mapImage}
          contentFit="cover"
          transition={200}
        />
        
        {/* Help button overlay */}
        <Pressable style={styles.helpButton} onPress={handleShowLegend}>
          <Text style={styles.helpButtonIcon}>❓</Text>
        </Pressable>
        
        {/* Overlay with expand hint */}
        <View style={styles.mapOverlay}>
          <View style={styles.expandHint}>
            <Text style={styles.expandIcon}>🔍</Text>
            <ThemedText type="caption" style={styles.expandText}>
              Нажмите для увеличения
            </ThemedText>
          </View>
        </View>
      </Pressable>

      {/* Map Legend Modal */}
      <MapLegend 
        visible={showLegend}
        onClose={() => setShowLegend(false)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: DesignTokens.borderRadius.card,
    overflow: 'hidden',
    backgroundColor: Colors.light.surfaceAlt,
    position: 'relative',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceAlt,
  },
  loadingIcon: {
    fontSize: 32,
    marginBottom: DesignTokens.spacing.sm,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  
  // No map state
  noMapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  noMapIcon: {
    fontSize: 28,
    marginBottom: DesignTokens.spacing.sm,
    opacity: 0.6,
  },
  noMapText: {
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  
  // Map display
  mapImage: {
    width: '100%',
    height: '100%',
  },
  
  // Help button
  helpButton: {
    position: 'absolute',
    top: DesignTokens.spacing.sm,
    right: DesignTokens.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  helpButtonIcon: {
    fontSize: 14,
    color: 'white',
  },
  
  // Overlay and expand hint
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: {
    fontSize: 16,
    marginRight: DesignTokens.spacing.xs,
  },
  expandText: {
    color: Colors.light.surface,
    textAlign: 'center',
    fontSize: 12,
  },
}); 