import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    StatusBar as RNStatusBar,
    SafeAreaView,
    StyleSheet
} from 'react-native';
import { BirdCard } from '../../components/BirdCard';
import { ExpandableSearchBar } from '../../components/ExpandableSearchBar';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useBirds } from '../../hooks/useBirds';
import { useFilteredBirds } from '../../hooks/useFilteredBirds';
import { useImageCache } from '../../hooks/useImageCache';
import { getPrimaryBirdImageUrl } from '../../lib/imageUtils';
import type { BirdListItem } from '../../types/bird';

/**
 * AllBirds screen - main landing page showing all Kazakhstan birds
 * Implements mobile-first design with 75% neutrals and sky-blue accents
 * Uses FlashList for optimal performance with large datasets in a 2-column grid
 * Features optimized image caching and preloading for smooth scrolling
 * Includes expandable search functionality with smooth transitions
 * @returns JSX.Element - AllBirds screen component
 */
export default function AllBirdsScreen() {
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Use filtered birds when searching, all birds when not
  const { data: allBirds, isLoading: allBirdsLoading, error: allBirdsError } = useBirds();
  const { 
    data: filteredBirds, 
    isLoading: filteredLoading, 
    error: filteredError 
  } = useFilteredBirds(
    searchText.trim() ? { searchText: searchText.trim() } : undefined
  );
  
  // Determine which dataset to use
  const birds = searchText.trim() ? filteredBirds : allBirds;
  const isLoading = searchText.trim() ? filteredLoading : allBirdsLoading;
  const error = searchText.trim() ? filteredError : allBirdsError;
  
  const { preloadImages } = useImageCache({ maxCacheSize: 150, maxCacheAge: 7200 });

  // Smooth transition animation when search results change
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [searchText, fadeAnim]);

  // Preload images when bird data is available
  useEffect(() => {
    const preloadSignedUrls = async () => {
      if (!birds || birds.length === 0) return;

      try {
        // Generate signed URLs for the first 20 birds
        const urlPromises = birds.slice(0, 20).map(bird => 
          getPrimaryBirdImageUrl(bird.id, bird.scientific_name)
        );
        
        const imageUrls = await Promise.all(urlPromises);
        const validUrls = imageUrls.filter(url => url.length > 0);
        
        if (validUrls.length > 0) {
          await preloadImages(validUrls);
        }
      } catch (error) {
        console.warn('⚠️ Failed to preload signed URLs:', error);
      }
    };

    preloadSignedUrls();
  }, [birds, preloadImages]);

  /**
   * Handles search text changes from the expandable search bar
   * @param text - New search text
   */
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  /**
   * Renders individual bird item for FlashList grid
   * @param item - Bird data to render
   * @returns JSX.Element - BirdCard component styled for grid
   */
  const renderBird = ({ item }: { item: BirdListItem }) => (
    <BirdCard bird={item} variant="grid" />
  );

  /**
   * Optimized getItemType for FlashList performance
   * @param item - Bird data item
   * @returns string - Item type for recycling optimization
   */
  const getItemType = (item: BirdListItem) => {
    // Use bird family for better recycling optimization
    return item.family || 'unknown';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.light.background} />
        <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>
            {searchText.trim() ? 'Поиск птиц...' : 'Загрузка птиц...'}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.light.background} />
        <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.header}>
          <ThemedText style={styles.title}>Qustar</ThemedText>
          <ExpandableSearchBar
            onSearchChange={handleSearchChange}
            searchText={searchText}
            placeholder="Поиск птиц..."
          />
        </ThemedView>
        <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>
            {searchText.trim() 
              ? 'Ошибка при поиске птиц'
              : 'Не удалось загрузить список птиц'
            }
          </ThemedText>
          <ThemedText style={styles.errorSubtext}>
            Проверьте подключение к интернету и попробуйте еще раз
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.light.background} />
      
      {/* Header with Search */}
      <ThemedView {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} style={styles.header}>
        <ThemedText style={styles.title}>Qustar</ThemedText>
        <ExpandableSearchBar
          onSearchChange={handleSearchChange}
          searchText={searchText}
          placeholder="Поиск птиц..."
        />
      </ThemedView>

      {/* Content with smooth transitions */}
      <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.contentWrapper}>
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Birds Grid */}
          {birds && birds.length > 0 ? (
            <FlashList
              data={birds}
              renderItem={renderBird}
              getItemType={getItemType}
              numColumns={2}
              estimatedItemSize={220}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              // Performance optimizations
              removeClippedSubviews={true}
              // Accessibility
              accessible={true}
              accessibilityLabel={
                searchText.trim() 
                  ? `Результаты поиска птиц по запросу "${searchText.trim()}"`
                  : "Список всех птиц Казахстана"
              }
            />
          ) : (
            <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.emptyStateContainer}>
              <ThemedText style={styles.emptyText}>
                {searchText.trim() 
                  ? `По запросу "${searchText.trim()}" ничего не найдено`
                  : 'Список птиц пуст'
                }
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                {searchText.trim() 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Проверьте подключение к базе данных'
                }
              </ThemedText>
            </ThemedView>
          )}
        </Animated.View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface, // Pure white background
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: Colors.light.surface, // Pure white header
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.xs,
    paddingBottom: DesignTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...DesignTokens.shadows.subtle,
  },
  title: {
    color: Colors.light.primary, // Cerulean for primary accent
    letterSpacing: 0.5,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.light.surface, // Pure white background
  },
  gridContent: {
    paddingVertical: DesignTokens.spacing.xs,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xxl * 1.5,
    backgroundColor: Colors.light.surface, // Pure white background
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xxl * 1.5,
    backgroundColor: Colors.light.surface, // Pure white background
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
    color: '#CCCCCC', // Very light grey for error subtext
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
    color: '#BBBBBB', // Light grey for empty state main text
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DesignTokens.spacing.xxl,
    color: '#CCCCCC', // Very light grey for empty state subtext
    fontSize: 14,
  },
});
