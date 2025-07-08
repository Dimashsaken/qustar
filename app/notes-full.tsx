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
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { UserNoteCard } from '../components/UserNoteCard';
import { Colors, DesignTokens } from '../constants/Colors';
import { useUserComments } from '../hooks/useComments';

/**
 * Full-screen notes page showing all user's notes about birds
 * @returns JSX.Element - Full-screen notes component
 */
export default function NotesFullScreen() {
  const {
    comments: userNotes,
    isLoading,
    error,
    count,
    refetch
  } = useUserComments();

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
        Мои заметки
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.accent} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка заметок...
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
        {error?.message || 'Не удалось загрузить заметки'}
      </ThemedText>
      <Pressable style={styles.retryButton} onPress={() => refetch()}>
        <ThemedText type="bold" style={styles.retryButtonText}>
          Попробовать снова
        </ThemedText>
      </Pressable>
    </View>
  );

  /**
   * Renders empty notes state
   */
  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyState}>
        <IconSymbol name="note.text" size={64} color={Colors.light.textMuted} />
        <ThemedText type="title" style={styles.emptyTitle}>
          Нет заметок
        </ThemedText>
        <ThemedText type="default" style={styles.emptySubtext}>
          Создайте первую заметку о птице, которую встретили или изучили
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
    </View>
  );

  /**
   * Renders notes list
   */
  const renderNotes = () => (
    <ThemedView style={styles.container}>
      <FlashList
        data={userNotes}
        renderItem={({ item }) => (
          <UserNoteCard
            note={item}
            birdInfo={item.bird}
          />
        )}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        {isLoading ? renderLoading() : 
         error ? renderError() : 
         count === 0 ? renderEmpty() : 
         renderNotes()}
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

  // List container
  listContainer: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
  },

  // Center container for loading, error, empty states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
    backgroundColor: Colors.light.background,
  },

  // Loading state
  loadingText: {
    marginTop: DesignTokens.spacing.md,
    color: Colors.light.textMuted,
  },

  // Error state
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
    backgroundColor: Colors.light.accent,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  retryButtonText: {
    color: Colors.light.surface,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyTitle: {
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.md,
  },
  emptySubtext: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DesignTokens.spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  browseButtonText: {
    color: Colors.light.surface,
  },
}); 