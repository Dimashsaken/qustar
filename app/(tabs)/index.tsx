import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { BirdCard } from '../../components/BirdCard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useBirds } from '../../hooks/useBirds';
import { useImageCache } from '../../hooks/useImageCache';
import { getPrimaryBirdImageUrl } from '../../lib/imageUtils';
import type { BirdListItem } from '../../types/bird';

/**
 * AllBirds screen - main landing page showing all Kazakhstan birds
 * Implements mobile-first design with 75% neutrals and sky-blue accents
 * Uses FlashList for optimal performance with large datasets in a 2-column grid
 * Features optimized image caching and preloading for smooth scrolling
 * @returns JSX.Element - AllBirds screen component
 */
export default function AllBirdsScreen() {
  const { data: birds, isLoading, error } = useBirds();
  const { preloadImages } = useImageCache({ maxCacheSize: 150, maxCacheAge: 7200 });

  // Generate image URLs for preloading
  const imageUrls = useMemo(() => {
    if (!birds) return [];
    
    return birds.slice(0, 50).map(bird => 
      getPrimaryBirdImageUrl(bird.id, bird.scientific_name)
    ).filter(url => url.length > 0);
  }, [birds]);

  // Preload images when bird data is available
  useEffect(() => {
    if (imageUrls.length > 0) {
      preloadImages(imageUrls);
    }
  }, [imageUrls, preloadImages]);

  /**
   * Renders individual bird item for FlashList grid
   * @param item - Bird data to render
   * @returns JSX.Element - BirdCard component styled for grid
   */
  const renderBird = ({ item }: { item: BirdListItem }) => (
    <BirdCard bird={item} variant="grid" />
  );

  /**
   * Optimized key extractor for FlashList performance
   * @param item - Bird data
   * @returns string - Unique key for the item
   */
  const keyExtractor = (item: BirdListItem): string => `bird-${item.id}`;

  /**
   * Renders loading state
   * @returns JSX.Element - Loading indicator
   */
  const renderLoading = () => (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading Kazakhstan birds...
          </ThemedText>
        </View>
      </SafeAreaView>
    </>
  );

  /**
   * Renders error state
   * @returns JSX.Element - Error message
   */
  const renderError = () => (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ThemedText type="title" style={styles.errorText}>
            Failed to load birds
          </ThemedText>
          <ThemedText type="default" style={styles.errorSubtext}>
            {error?.message || 'Please check your connection and try again'}
          </ThemedText>
        </View>
      </SafeAreaView>
    </>
  );

  /**
   * Renders empty state
   * @returns JSX.Element - Empty state message
   */
  const renderEmpty = () => (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ThemedText type="title" style={styles.emptyText}>
            No birds found
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            The bird database appears to be empty. Please check your connection and try again.
          </ThemedText>
        </View>
      </SafeAreaView>
    </>
  );

  if (isLoading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (!birds || birds.length === 0) {
    return renderEmpty();
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ThemedText type="heading" style={styles.title}>
                Qustar
              </ThemedText>
              <ThemedText type="caption" style={styles.tagline}>
                Kazakhstan Bird Identifier
              </ThemedText>
            </View>
          </View>
          
          <FlashList
            data={birds}
            renderItem={renderBird}
            numColumns={2}
            estimatedItemSize={200}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            removeClippedSubviews={true}
            onEndReachedThreshold={0.5}
            getItemType={() => 'bird-card'}
          />
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surfaceAlt, // Mist grey background
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.surfaceAlt,
  },
  header: {
    backgroundColor: Colors.light.surface, // Pure white header
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    ...DesignTokens.shadows.subtle,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    color: Colors.light.primary, // Cerulean for primary accent
    marginBottom: DesignTokens.spacing.xs,
    letterSpacing: 0.5,
  },
  tagline: {
    color: Colors.light.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  gridContent: {
    paddingVertical: DesignTokens.spacing.xs,
    paddingHorizontal: DesignTokens.spacing.xs,
  },
  itemSeparator: {
    height: DesignTokens.spacing.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xxl * 1.5,
  },
  loadingText: {
    marginTop: DesignTokens.spacing.lg,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
    color: Colors.light.error,
  },
  errorSubtext: {
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.light.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
    color: Colors.light.textMuted,
  },
  emptySubtext: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DesignTokens.spacing.xxl,
    color: Colors.light.textMuted,
  },
});
