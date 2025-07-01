import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, StatusBar as RNStatusBar, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapLegend } from '../../components/MapLegend';
import { ThemedText } from '../../components/ThemedText';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useBird, useBirdMapUrl } from '../../hooks/useBirds';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Full-screen interactive map screen with zoom functionality
 * Displays bird migration/habitat maps with pinch-to-zoom
 * @returns JSX.Element - Interactive map screen component
 */
export default function BirdMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bird } = useBird(id || '');
  const { data: mapUrl, isLoading, error } = useBirdMapUrl(id || '', bird?.scientific_name);
  
  // State for legend modal
  const [showLegend, setShowLegend] = useState(false);
  
  // Animation values for zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  /**
   * Handles pinch gesture for zooming
   */
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(3, scale.value));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.2) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
    });

  /**
   * Animated style for image transformation
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
    };
  });



  /**
   * Shows the map legend tutorial
   */
  const handleShowLegend = () => {
    setShowLegend(true);
  };

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка карты...
      </ThemedText>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>🗺️</Text>
      <ThemedText type="title" style={styles.errorText}>
        Карта недоступна
      </ThemedText>
      <ThemedText type="default" style={styles.errorSubtext}>
        Карта для этой птицы не найдена или недоступна
      </ThemedText>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ThemedText type="bold" style={styles.backButtonTextWhite}>
          Назад
        </ThemedText>
      </Pressable>
    </View>
  );

  const displayName = bird?.common_name_ru || bird?.common_name_en || bird?.scientific_name || 'Карта птицы';

  return (
    <>
      <StatusBar style="light" backgroundColor="black" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button, title, and help button */}
        <View style={styles.header}>
          <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          
          <View style={styles.headerTitle}>
            <ThemedText type="subtitle" style={styles.headerTitleText} numberOfLines={1}>
              {displayName}
            </ThemedText>
            <ThemedText type="caption" style={styles.headerSubtitle}>
              Карта ареала и миграции
            </ThemedText>
          </View>

          <View style={styles.headerActions}>
            {mapUrl && Platform.OS === 'ios' && (
              <Pressable style={styles.actionButton} onPress={handleShowLegend}>
                <Text style={styles.helpIcon}>❓</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Map content */}
        <View style={styles.mapContainer}>
          {isLoading && renderLoading()}
          {(error || !mapUrl) && renderError()}
          
          {mapUrl && (
            <GestureDetector gesture={pinchGesture}>
              <Animated.View style={[styles.imageContainer, animatedStyle]}>
                <Image 
                  source={{ uri: mapUrl }}
                  style={styles.mapImage}
                  contentFit="contain"
                />
              </Animated.View>
            </GestureDetector>
          )}
        </View>

        {/* Instructions overlay */}
        {mapUrl && Platform.OS === 'ios' && (
          <View style={styles.instructionsOverlay}>
            <ThemedText type="caption" style={styles.instructionsText}>
              Используйте жест щипка для увеличения карты
            </ThemedText>
            <Pressable onPress={handleShowLegend}>
              <ThemedText type="caption" style={[styles.instructionsText, styles.helpLink]}>
                • Нажмите ❓ для справочника по карте
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Map Legend Modal - Only on iOS */}
        {Platform.OS === 'ios' && (
          <MapLegend 
            visible={showLegend}
            onClose={() => setShowLegend(false)}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: DesignTokens.spacing.lg,
  },
  headerTitleText: {
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 16,
    color: 'white',
  },
  
  // Map container
  mapContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: screenWidth,
    height: screenHeight - 150, // Account for header and safe area
  },
  
  // Loading and error states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.xxl,
  },
  loadingText: {
    marginTop: DesignTokens.spacing.lg,
    color: 'white',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: DesignTokens.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
    color: 'white',
  },
  errorSubtext: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.lg,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  backButtonTextWhite: {
    color: Colors.light.surface,
  },
  
  // Instructions overlay
  instructionsOverlay: {
    position: 'absolute',
    bottom: DesignTokens.spacing.lg,
    left: DesignTokens.spacing.lg,
    right: DesignTokens.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.card,
    gap: DesignTokens.spacing.xs,
  },
  instructionsText: {
    color: 'white',
    textAlign: 'center',
  },
  helpLink: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
}); 