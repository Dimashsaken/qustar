import { FlashList } from '@shopify/flash-list';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BirdCard } from '../../components/BirdCard';
import { useBirds } from '../../hooks/useBirds';
import type { BirdListItem } from '../../types/bird';

/**
 * AllBirds screen - main landing page showing all Kazakhstan birds
 * Uses FlashList for optimal performance with large datasets in a 2-column grid
 * @returns JSX.Element - AllBirds screen component
 */
export default function AllBirdsScreen() {
  const { data: birds, isLoading, error } = useBirds();

  // Debug logging to understand what's happening
  useEffect(() => {
    console.log('🐦 AllBirdsScreen Debug:', {
      isLoading,
      error: error?.message,
      birdsCount: birds?.length,
      birdsData: birds?.slice(0, 3) // First 3 birds for inspection
    });
  }, [birds, isLoading, error]);

  /**
   * Renders individual bird item for FlashList grid
   * @param item - Bird data to render
   * @returns JSX.Element - BirdCard component styled for grid
   */
  const renderBird = ({ item }: { item: BirdListItem }) => (
    <BirdCard bird={item} variant="grid" />
  );

  /**
   * Renders loading state
   * @returns JSX.Element - Loading indicator
   */
  const renderLoading = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading Kazakhstan birds...</Text>
      </View>
    </SafeAreaView>
  );

  /**
   * Renders error state
   * @returns JSX.Element - Error message
   */
  const renderError = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load birds</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || 'Please check your connection and try again'}
        </Text>
      </View>
    </SafeAreaView>
  );

  /**
   * Renders empty state
   * @returns JSX.Element - Empty state message
   */
  const renderEmpty = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No birds found</Text>
        <Text style={styles.emptySubtext}>
          The bird database appears to be empty. Please check your connection and try again.
        </Text>
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    console.log('🔄 Showing loading state');
    return renderLoading();
  }

  if (error) {
    console.log('❌ Showing error state:', error.message);
    return renderError();
  }

  if (!birds || birds.length === 0) {
    console.log('📭 Showing empty state');
    return renderEmpty();
  }

  console.log('✅ Showing birds grid:', birds.length);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kazakhstan Birds</Text>
          <Text style={styles.subtitle}>{birds.length} species</Text>
        </View>
        
        <FlashList
          data={birds}
          renderItem={renderBird}
          numColumns={2}
          estimatedItemSize={200} // Increased for grid items
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  gridContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  itemSeparator: {
    height: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});
