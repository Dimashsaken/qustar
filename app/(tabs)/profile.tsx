import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useUserComments } from '../../hooks/useComments';
import { useFavorites } from '../../hooks/useFavorites';

/**
 * Profile screen with user information, favorites and notes sections
 * @returns JSX.Element - Profile screen component
 */
export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const { 
    favorites, 
    isLoading: favoritesLoading, 
    error: favoritesError, 
    count: favoritesCount 
  } = useFavorites();
  
  const {
    comments: userNotes,
    isLoading: notesLoading,
    error: notesError,
    count: notesCount
  } = useUserComments();



  /**
   * Handles favorites section press to show full page
   */
  const handleFavoritesPress = () => {
    // Navigate to a dedicated full-screen favorites page
    router.push('/favorites-full' as any);
  };

  /**
   * Handles notes section press to show full page
   */
  const handleNotesPress = () => {
    router.push('/notes-full' as any);
  };

  /**
   * Renders user profile header
   */
  const renderProfileHeader = () => (
    <ThemedView style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={40} color={Colors.light.surface} />
        </View>
      </View>
      <View style={styles.userInfo}>
        <ThemedText type="title" style={styles.userName}>
          {user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь'}
        </ThemedText>
        <ThemedText type="default" style={styles.userEmail}>
          {user?.email}
        </ThemedText>
      </View>
      <Pressable onPress={() => router.push('/settings' as any)} style={styles.settingsButton}>
        <IconSymbol name="gearshape.fill" size={24} color={Colors.light.textMuted} />
      </Pressable>
    </ThemedView>
  );

  /**
   * Renders stats section
   */
  const renderStats = () => (
    <ThemedView style={styles.statsSection}>
      <View style={styles.statItem}>
        <ThemedText type="title" style={styles.statNumber}>
          {favoritesCount}
        </ThemedText>
        <ThemedText type="default" style={styles.statLabel}>
          Избранных птиц
        </ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="title" style={styles.statNumber}>
          {notesCount}
        </ThemedText>
        <ThemedText type="default" style={styles.statLabel}>
          Заметок
        </ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="title" style={styles.statNumber}>
          0
        </ThemedText>
        <ThemedText type="default" style={styles.statLabel}>
          Наблюдений
        </ThemedText>
      </View>
    </ThemedView>
  );

  /**
   * Renders favorites section with grid display
   */
  const renderFavoritesSection = () => {

    return (
      <ThemedView style={styles.section}>
        <Pressable style={styles.sectionHeader} onPress={handleFavoritesPress}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol 
              name="heart.fill" 
              size={20} 
              color={Colors.light.primary} 
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Избранные птицы
            </ThemedText>
            <View style={styles.badge}>
              <ThemedText type="default" style={styles.badgeText}>
                {favoritesCount}
              </ThemedText>
            </View>
          </View>
        </Pressable>

        {favoritesLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <ThemedText type="default" style={styles.loadingText}>
              Загрузка...
            </ThemedText>
          </View>
        )}

        {favoritesError && (
          <ThemedText type="default" style={styles.errorText}>
            Ошибка загрузки избранного
          </ThemedText>
        )}

        {!favoritesLoading && !favoritesError && favoritesCount === 0 && (
          <ThemedText type="default" style={styles.emptyText}>
            Нет избранных птиц
          </ThemedText>
        )}

        {!favoritesLoading && !favoritesError && favoritesCount > 0 && (
          <Pressable 
            style={styles.viewAllButton}
            onPress={handleFavoritesPress}
          >
            <ThemedText type="default" style={styles.viewAllText}>
              Показать все ({favoritesCount})
            </ThemedText>
            <IconSymbol name="arrow.right" size={16} color={Colors.light.primary} />
          </Pressable>
        )}
      </ThemedView>
    );
  };

  /**
   * Renders notes section with list display
   */
  const renderNotesSection = () => {

    return (
      <ThemedView style={styles.section}>
        <Pressable style={styles.sectionHeader} onPress={handleNotesPress}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol 
              name="note.text" 
              size={20} 
              color={Colors.light.accent} 
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Мои заметки
            </ThemedText>
            <View style={[styles.badge, { backgroundColor: Colors.light.accent }]}>
              <ThemedText type="default" style={styles.badgeText}>
                {notesCount}
              </ThemedText>
            </View>
          </View>
        </Pressable>

        {notesLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.light.accent} />
            <ThemedText type="default" style={styles.loadingText}>
              Загрузка заметок...
            </ThemedText>
          </View>
        )}

        {notesError && (
          <ThemedText type="default" style={styles.errorText}>
            Ошибка загрузки заметок
          </ThemedText>
        )}

        {!notesLoading && !notesError && notesCount === 0 && (
          <ThemedText type="default" style={styles.emptyText}>
            У вас пока нет заметок о птицах
          </ThemedText>
        )}

        {!notesLoading && !notesError && notesCount > 0 && (
          <Pressable 
            style={styles.viewAllButton}
            onPress={() => router.push('/notes-full' as any)}
          >
            <ThemedText type="default" style={[styles.viewAllText, { color: Colors.light.accent }]}>
              Показать все заметки ({notesCount})
            </ThemedText>
            <IconSymbol name="arrow.right" size={16} color={Colors.light.accent} />
          </Pressable>
        )}
      </ThemedView>
    );
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {renderProfileHeader()}
          {renderStats()}
          {renderFavoritesSection()}
          {renderNotesSection()}
          
          {/* Additional profile sections can be added here */}
        </ScrollView>
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
  },
  
  // Profile header styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.xl,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    marginRight: DesignTokens.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.xs,
    textTransform: 'capitalize',
  },
  userEmail: {
    color: Colors.light.textMuted,
    fontSize: 14,
  },
  settingsButton: {
    padding: DesignTokens.spacing.sm,
  },

  // Stats section styles
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DesignTokens.spacing.lg,
    backgroundColor: Colors.light.surface,
    marginTop: DesignTokens.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.light.textMuted,
    fontSize: 12,
    marginTop: DesignTokens.spacing.xs,
  },

  // Section styles
  section: {
    backgroundColor: Colors.light.surface,
    marginTop: DesignTokens.spacing.sm,
    paddingBottom: DesignTokens.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    color: Colors.light.text,
    marginLeft: DesignTokens.spacing.sm,
  },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: DesignTokens.spacing.sm,
  },
  badgeText: {
    color: Colors.light.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Loading and error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing.lg,
  },
  loadingText: {
    color: Colors.light.textMuted,
    marginLeft: DesignTokens.spacing.sm,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    paddingVertical: DesignTokens.spacing.lg,
  },
  emptyText: {
    color: Colors.light.textMuted,
    textAlign: 'center',
    paddingVertical: DesignTokens.spacing.lg,
  },



  // View all button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  viewAllText: {
    color: Colors.light.primary,
    marginRight: DesignTokens.spacing.xs,
  },


}); 