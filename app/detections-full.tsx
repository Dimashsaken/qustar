import { FlashList } from '@shopify/flash-list';
import { router, Stack } from 'expo-router';
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
import { DetectionCard } from '../components/DetectionCard';
import { DetectionSummary } from '../components/DetectionSummary';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAudioDetections } from '../hooks/useAudioDetections';
import type { DetectionWithAudio } from '../types/audio';

/**
 * Data structure for FlashList items
 */
type ListItem = 
  | { type: 'summary' }
  | { type: 'detection'; detection: DetectionWithAudio; index: number };

/**
 * Full-screen detections page showing all user's bird detection history
 * @returns JSX.Element - Full-screen detections component
 */
export default function DetectionsFullScreen() {
  const { 
    detections, 
    isLoading, 
    error, 
    refetch,
    forceRefetch 
  } = useAudioDetections();

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
        Мои обнаружения
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.info} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка обнаружений...
      </ThemedText>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <ThemedText type="title" style={styles.errorText}>
        Ошибка загрузки
      </ThemedText>
      <ThemedText type="default" style={styles.errorSubtext}>
        {error?.message || 'Не удалось загрузить записи'}
      </ThemedText>
      <Pressable style={styles.retryButton} onPress={() => forceRefetch()}>
        <ThemedText type="bold" style={styles.retryButtonText}>
          Попробовать снова
        </ThemedText>
      </Pressable>
    </View>
  );

  /**
   * Renders empty detections state
   */
  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyState}>
        <IconSymbol name="waveform" size={64} color={Colors.light.textMuted} />
        <ThemedText type="title" style={styles.emptyTitle}>
          Нет записей
        </ThemedText>
        <ThemedText type="default" style={styles.emptySubtext}>
          Перейдите на вкладку "Запись" и начните записывать звуки птиц для их распознавания
        </ThemedText>
        <Pressable 
          style={styles.recordButton} 
          onPress={() => router.push('/(tabs)/record' as any)}
        >
          <ThemedText type="bold" style={styles.recordButtonText}>
            Начать запись
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  /**
   * Renders detections list with summary
   */
  const renderDetections = () => {
    const listData: ListItem[] = [
      { type: 'summary' }, 
      ...detections.map((detection: DetectionWithAudio, index: number) => ({ 
        type: 'detection' as const, 
        detection, 
        index 
      }))
    ];

    return (
      <ThemedView style={styles.container}>
        <FlashList
          data={listData}
          renderItem={({ item }: { item: ListItem }) => {
            if (item.type === 'summary') {
              return <DetectionSummary detections={detections} />;
            }
            return (
              <DetectionCard
                detection={item.detection}
              />
            );
          }}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          getItemType={(item: ListItem) => item.type}
        />
      </ThemedView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        {isLoading ? renderLoading() : 
         error ? renderError() : 
         detections.length === 0 ? renderEmpty() : 
         renderDetections()}
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

  // Content styles
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  loadingText: {
    marginTop: DesignTokens.spacing.md,
    color: Colors.light.textMuted,
  },
  
  // Error state styles
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  errorSubtext: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.light.info,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: 8,
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
    marginTop: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
  },
  emptySubtext: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DesignTokens.spacing.lg,
  },
  recordButton: {
    backgroundColor: Colors.light.info,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: 8,
  },
  recordButtonText: {
    color: Colors.light.surface,
  },

  // List styles
  listContainer: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
  },
}); 