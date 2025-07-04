import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, StatusBar as RNStatusBar, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ThemedText } from '../../components/ThemedText';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useBird, useBirdImageUrls } from '../../hooks/useBirds';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Full-screen interactive bird image screen with zoom functionality
 * Displays bird photos with pinch-to-zoom capability
 * @returns JSX.Element - Interactive image screen component
 */
export default function BirdImageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bird } = useBird(id || '');
  const { data: imageUrls = [], isLoading, error } = useBirdImageUrls(id || '', bird?.scientific_name);
  
  // Animation values for zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  
  // Animation values for instructions overlay
  const backgroundOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  /**
   * Start animations when component mounts and image is loaded
   */
  useEffect(() => {
    if (imageUrls[0] && !isLoading && !error) {
      // Fade in background
      backgroundOpacity.value = withTiming(1, { duration: 400 });
      // Slide up content
      contentTranslateY.value = withSpring(0, { 
        damping: 15,
        stiffness: 150 
      });
    }
  }, [imageUrls, isLoading, error]);

  /**
   * Handles pinch gesture for zooming
   */
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(4, scale.value));
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
   * Animated style for background opacity
   */
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  /**
   * Animated style for content slide up
   */
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: contentTranslateY.value },
      ],
    };
  });

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка изображения...
      </ThemedText>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>🐦</Text>
      <ThemedText type="title" style={styles.errorText}>
        Изображение недоступно
      </ThemedText>
      <ThemedText type="default" style={styles.errorSubtext}>
        Изображение для этой птицы не найдено или недоступно
      </ThemedText>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ThemedText type="bold" style={styles.backButtonTextWhite}>
          Назад
        </ThemedText>
      </Pressable>
    </View>
  );

  const displayName = bird?.common_name_ru || bird?.common_name_en || bird?.scientific_name || 'Фото птицы';
  const primaryImageUrl = imageUrls[0];

  return (
    <>
      <StatusBar style="light" backgroundColor="black" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button and title */}
        <View style={styles.header}>
          <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          
          <View style={styles.headerTitle}>
            <ThemedText type="subtitle" style={styles.headerTitleText} numberOfLines={1}>
              {displayName}
            </ThemedText>
            <ThemedText type="caption" style={styles.headerSubtitle}>
              Фотография птицы
            </ThemedText>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Image content */}
        <View style={styles.imageContainer}>
          {isLoading && renderLoading()}
          {(error || !primaryImageUrl) && renderError()}
          
          {primaryImageUrl && (
            <GestureDetector gesture={pinchGesture}>
              <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                <Image 
                  source={{ uri: primaryImageUrl }}
                  style={styles.fullImage}
                  contentFit="contain"
                  placeholder="🐦"
                  transition={200}
                />
              </Animated.View>
            </GestureDetector>
          )}
        </View>

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
  headerSpacer: {
    width: 40, // Same width as back button for balance
  },
  
  // Image container
  imageContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
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
  instructionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.3, // Adjust height as needed
    backgroundColor: 'transparent', // Make background transparent
    justifyContent: 'flex-end', // Align content to the bottom
  },
  instructionsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomLeftRadius: DesignTokens.borderRadius.card,
    borderBottomRightRadius: DesignTokens.borderRadius.card,
  },
  instructionsContent: {
    position: 'absolute',
    bottom: DesignTokens.spacing.lg,
    left: DesignTokens.spacing.lg,
    right: DesignTokens.spacing.lg,
    backgroundColor: 'transparent', // Make content transparent
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
  },
  instructionsText: {
    color: 'white',
    textAlign: 'center',
  },
}); 