import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';
import { BirdCard } from '../components/BirdCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';
import { useFavorites } from '../hooks/useFavorites';
import type { BirdListItem } from '../types/bird';

/**
 * Full-screen favorites page showing all user's favorite birds
 * @returns JSX.Element - Full-screen favorites component
 */
export default function FavoritesFullScreen() {
  const { 
    favorites, 
    isLoading, 
    error, 
    count,
    refetch 
  } = useFavorites();

  /**
   * Handles bird card press to navigate to detail screen
   */
  const handleBirdPress = (bird: BirdListItem) => {
    router.push(`/bird/${bird.id}` as any);
  };

  /**
   * Handles back button press
   */
  const handleBackPress = () => {
    router.back();
  };

  /**
   * Renders header with back button and title
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onPress={handleBackPress} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
      </Pressable>
      <ThemedText type="title" style={styles.title}>
        Избранные птицы
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <ThemedView style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка избранного...
      </ThemedText>
    </ThemedView>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <ThemedView style={styles.centerContainer}>
      <ThemedText type="title" style={styles.errorText}>
        Ошибка загрузки
      </ThemedText>
      <ThemedText type="default" style={styles.errorSubtext}>
        {error?.message || 'Не удалось загрузить избранное'}
      </ThemedText>
      <Pressable style={styles.retryButton} onPress={() => refetch()}>
        <ThemedText type="bold" style={styles.retryButtonText}>
          Попробовать снова
        </ThemedText>
      </Pressable>
    </ThemedView>
  );

  /**
   * Renders empty favorites state
   */
  const renderEmpty = () => (
    <ThemedView style={styles.centerContainer}>
      <View style={styles.emptyState}>
        <IconSymbol name="heart" size={64} color={Colors.light.textMuted} />
        <ThemedText type="title" style={styles.emptyTitle}>
          Нет избранных птиц
        </ThemedText>
        <ThemedText type="default" style={styles.emptySubtext}>
          Добавьте птиц в избранное, нажав на значок сердца в карточке птицы
        </ThemedText>
        <Pressable 
          style={styles.browseButton} 
          onPress={() => router.push('/(tabs)/' as any)}
        >
          <ThemedText type="bold" style={styles.browseButtonText}>
            Посмотреть птиц
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );

  /**
   * Renders favorites list
   */
  const renderFavorites = () => (
    <ThemedView style={styles.container}>
      <View style={styles.statsContainer}>
        <ThemedText type="default" style={styles.statsText}>
          {count} {count === 1 ? 'птица' : count < 5 ? 'птицы' : 'птиц'}
        </ThemedText>
      </View>

      <FlashList
        data={favorites}
        renderItem={({ item }) => (
          <BirdCard
            bird={item}
            variant="grid"
            onPress={() => handleBirdPress(item)}
          />
        )}
        estimatedItemSize={180}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        {isLoading ? renderLoading() : 
         error ? renderError() : 
         count === 0 ? renderEmpty() : 
         renderFavorites()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1,
    backgroundColor: Colors.light.background 
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceAlt,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.light.text,
    marginHorizontal: DesignTokens.spacing.md,
  },
  headerSpacer: {
    width: 44,
  },

  // Stats styles
  statsContainer: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statsText: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    fontSize: 16,
  },

  // Center container for states
  centerContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.xl 
  },

  // Loading styles
  loadingText: { 
    marginTop: DesignTokens.spacing.lg,
    color: Colors.light.textMuted,
  },

  // Error styles
  errorText: { 
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
    color: Colors.light.error,
  },
  errorSubtext: { 
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.lg,
    color: Colors.light.textMuted,
  },
  retryButton: { 
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  retryButtonText: { 
    color: Colors.light.surface,
  },

  // Empty state styles
  emptyState: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyTitle: {
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.sm,
  },
  emptySubtext: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  browseButtonText: {
    color: Colors.light.surface,
  },

  // List styles
  listContainer: { 
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingBottom: 100 
  },
}); 