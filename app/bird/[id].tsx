import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Linking, Platform, Pressable, StatusBar as RNStatusBar, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BirdImage } from '../../components/BirdImage';
import { BirdMap } from '../../components/BirdMap';
import { CommentsList } from '../../components/CommentsList';
import { ThemedText } from '../../components/ThemedText';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useBird } from '../../hooks/useBirds';
import { useFavorites } from '../../hooks/useFavorites';
import { Bird } from '../../types/bird';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = screenHeight * 0.35; // 35% of screen height

/**
 * Constructs YouTube search URL for bird videos
 * @param bird - Bird object with names and scientific name
 * @returns string - YouTube search URL
 */
const createYouTubeSearchUrl = (bird: Bird): string => {
  const searchTerms: string[] = [];
  
  // Prioritize scientific name for accuracy
  if (bird.scientific_name) {
    searchTerms.push(bird.scientific_name);
  }
  
  // Add English common name if available
  if (bird.common_name_en) {
    searchTerms.push(bird.common_name_en);
  }
  
  // Add "bird video" for better results
  searchTerms.push('bird video');
  
  const query = searchTerms.join(' ');
  const encodedQuery = encodeURIComponent(query);
  
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
};

/**
 * Handles video button press to open YouTube search
 * @param bird - Bird object to search for
 */
const handleVideoPress = async (bird: Bird): Promise<void> => {
  try {
    const youtubeUrl = createYouTubeSearchUrl(bird);
    const canOpen = await Linking.canOpenURL(youtubeUrl);
    
    if (canOpen) {
      await Linking.openURL(youtubeUrl);
    } else {
      Alert.alert(
        'Ошибка',
        'Не удалось открыть YouTube. Проверьте, что у вас установлено приложение YouTube или браузер.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    Alert.alert(
      'Ошибка',
      'Произошла ошибка при открытии видео. Попробуйте снова.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Bird detail screen showing comprehensive bird information
 * Implements mobile-first design with sky-blue accents and clean card layout
 * Features a hero image layout with detailed bird data
 * @returns JSX.Element - Bird detail screen component
 */
export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bird, isLoading, error } = useBird(id || '');
  const { toggleFavorite, isFavorite, isAuthenticated, isAdding, isRemoving } = useFavorites();

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
            Загрузка информации о птице...
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
            Не удалось загрузить информацию о птице
          </ThemedText>
          <ThemedText type="default" style={styles.errorSubtext}>
            {error?.message || 'Проверьте соединение и попробуйте снова'}
          </ThemedText>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText type="bold" style={styles.backButtonTextWhite}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );

  /**
   * Renders not found state
   * @returns JSX.Element - Not found message
   */
  const renderNotFound = () => (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ThemedText type="title" style={styles.errorText}>
            Птица не найдена
          </ThemedText>
          <ThemedText type="default" style={styles.errorSubtext}>
            Запрашиваемая птица не найдена в нашей базе данных
          </ThemedText>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText type="bold" style={styles.backButtonTextWhite}>
              Вернуться
            </ThemedText>
          </Pressable>
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

  if (!bird) {
    return renderNotFound();
  }

  const displayName = bird.common_name_ru || bird.common_name_en || bird.scientific_name || 'Неизвестная птица';
  const kazakhName = bird.common_name_kz;
  const englishName = bird.common_name_en;

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Image Section - 35% of screen */}
            <View style={styles.heroContainer}>
              <BirdImage 
                birdId={bird.id} 
                scientificName={bird.scientific_name}
                size={screenWidth} 
                style={styles.heroImage} 
              />
              
              {/* Back button with new design system */}
              <Pressable style={styles.backButtonOverlay} onPress={() => router.back()}>
                <Text style={styles.backButtonIcon}>←</Text>
              </Pressable>
              
              {/* Fullscreen image button */}
              <Pressable 
                style={styles.fullscreenButtonOverlay} 
                onPress={() => router.push(`/image/${bird.id}` as any)}
                accessibilityLabel="Открыть изображение в полный экран"
                accessibilityRole="button"
              >
                <Text style={styles.fullscreenButtonIcon}>⤢</Text>
              </Pressable>
            </View>
            
            {/* Content card with elevation and rounded corners */}
            <View style={styles.contentCard}>
              {/* Bird name section at top of content */}
              <View style={styles.titleSection}>
                <View style={styles.titleContainer}>
                  <View style={styles.nameContainer}>
                    <ThemedText type="heading" style={styles.mainTitle}>
                      {displayName}
                    </ThemedText>
                    {bird.scientific_name && (
                      <ThemedText type="default" style={styles.scientificName}>
                        {bird.scientific_name}
                      </ThemedText>
                    )}
                  </View>
                  
                  {/* Video button next to name */}
                  <Pressable 
                    style={styles.videoButton} 
                    onPress={() => handleVideoPress(bird)}
                    accessibilityLabel="Открыть видео птицы на YouTube"
                    accessibilityRole="button"
                  >
                    <Text style={styles.videoButtonIcon}>▶</Text>
                  </Pressable>

                                   {/* Favorite button */}
                   <Pressable 
                     style={styles.favoriteButton} 
                     onPress={async () => {
                       if (!isAuthenticated) {
                         Alert.alert(
                           'Вход в систему',
                           'Для добавления птиц в избранное необходимо войти в систему',
                           [
                             { text: 'Отмена', style: 'cancel' },
                             { text: 'Войти', onPress: () => {
                               router.push('/(tabs)/favorites' as any);
                             }},
                           ]
                         );
                         return;
                       }
                       
                       try {
                         await toggleFavorite(bird);
                       } catch (error) {
                         Alert.alert('Ошибка', (error as Error).message);
                       }
                     }}
                     disabled={isAdding || isRemoving}
                     accessibilityLabel={isFavorite(bird.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                     accessibilityRole="button"
                   >
                     <Text style={[
                       styles.favoriteButtonIcon,
                       (isAdding || isRemoving) && { opacity: 0.5 }
                     ]}>
                       {isFavorite(bird.id) ? '❤️' : '🤍'}
                     </Text>
                   </Pressable>
                </View>
              </View>
              
              {/* Migration & Habitat Map */}
              <View style={styles.sectionCard}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Карта
                </ThemedText>
                <View style={styles.sectionDivider} />
                <BirdMap 
                  birdId={bird.id}
                  scientificName={bird.scientific_name ?? undefined}
                />
              </View>
              
              {/* Multi-language names */}
              {(kazakhName || englishName) && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Имена птицы
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  {kazakhName && (
                    <View style={styles.nameRow}>
                      <ThemedText type="bold" style={styles.nameLabel}>
                        Казахский:
                      </ThemedText>
                      <ThemedText type="default" style={styles.nameValue}>
                        {kazakhName}
                      </ThemedText>
                    </View>
                  )}
                  {englishName && (
                    <View style={styles.nameRow}>
                      <ThemedText type="bold" style={styles.nameLabel}>
                        Английский:
                      </ThemedText>
                      <ThemedText type="default" style={styles.nameValue}>
                        {englishName}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
              
              {/* Classification */}
              {(bird.family || bird.order) && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Классификация
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  {bird.family && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Семейство:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.family}
                      </ThemedText>
                    </View>
                  )}
                  {bird.order && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Отряд:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.order}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
              
              {/* Physical characteristics */}
              {(bird.size || bird.length_cm_min || bird.wingspan_cm_min || bird.weight_g_min) && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Физические характеристики
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  {bird.size && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Размер:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.size}
                      </ThemedText>
                    </View>
                  )}
                  {(bird.length_cm_min || bird.length_cm_max) && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Длина:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.length_cm_min}-{bird.length_cm_max} cm
                      </ThemedText>
                    </View>
                  )}
                  {(bird.wingspan_cm_min || bird.wingspan_cm_max) && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Размах крыльев:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.wingspan_cm_min}-{bird.wingspan_cm_max} cm
                      </ThemedText>
                    </View>
                  )}
                  {(bird.weight_g_min || bird.weight_g_max) && (
                    <View style={styles.infoRow}>
                      <ThemedText type="bold" style={styles.infoLabel}>
                        Вес:
                      </ThemedText>
                      <ThemedText type="default" style={styles.infoValue}>
                        {bird.weight_g_min}-{bird.weight_g_max} g
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}

              {/* Status in Kazakhstan */}
              {bird.status_kz && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Статус в Казахстане
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  <View style={styles.infoRow}>
                    <ThemedText type="bold" style={styles.infoLabel}>
                      Статус:
                    </ThemedText>
                    <ThemedText type="default" style={[styles.infoValue, styles.conservationStatus]}>
                      {bird.status_kz}
                    </ThemedText>
                  </View>
                </View>
              )}



              {/* Habitat information */}
              {bird.habitat && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Среда обитания
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  <ThemedText type="default" style={styles.habitatText}>
                    {bird.habitat}
                  </ThemedText>
                </View>
              )}



              {/* Subspecies in Kazakhstan */}
              {bird.subspecies_in_kz && (
                <View style={styles.sectionCard}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Подвиды в Казахстане
                  </ThemedText>
                  <View style={styles.sectionDivider} />
                  <ThemedText type="default" style={styles.descriptionText}>
                    {bird.subspecies_in_kz}
                  </ThemedText>
                </View>
              )}

              {/* Comments Section */}
              <CommentsList birdId={bird.id} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: Colors.light.surfaceAlt,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.surfaceAlt 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero section styles
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: Colors.light.surfaceAlt
  },
  heroImage: {
    width: screenWidth,
    height: HERO_HEIGHT,
    borderRadius: 0,
    borderWidth: 0,
  },

  backButtonOverlay: {
    position: 'absolute',
    top: DesignTokens.spacing.lg,
    left: DesignTokens.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.card,
    zIndex: 3,
  },
  backButtonIcon: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  fullscreenButtonOverlay: {
    position: 'absolute',
    top: DesignTokens.spacing.lg,
    right: DesignTokens.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...DesignTokens.shadows.card,
    zIndex: 3,
    // Add stronger shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fullscreenButtonIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Video button
  videoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.card,
  },
  videoButtonIcon: {
    color: Colors.light.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 2, // Optical centering for play icon
  },
  
  // Favorite button
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.card,
    marginLeft: DesignTokens.spacing.md,
  },
  favoriteButtonIcon: {
    fontSize: 18,
  },
  
  // Content card with elevation
  contentCard: {
    marginTop: -DesignTokens.spacing.xl,
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: DesignTokens.spacing.xxl,
    borderTopRightRadius: DesignTokens.spacing.xxl,
    paddingTop: DesignTokens.spacing.xxl * 1.5,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.xxl * 2,
    ...DesignTokens.shadows.card,
    zIndex: 2,
  },
  
  // Section cards
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.xl,
    ...DesignTokens.shadows.subtle,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: { 
    color: Colors.light.text,
    letterSpacing: -0.5,
    marginBottom: DesignTokens.spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    marginBottom: DesignTokens.spacing.lg,
  },
  
  // Name rows with enhanced styling
  nameRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: DesignTokens.borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  nameLabel: { 
    width: 110,
    color: Colors.light.textSecondary,
    flexShrink: 0,
  },
  nameValue: { 
    flex: 1,
    color: Colors.light.text,
  },
  
  // Info rows with better contrast
  infoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
  },
  infoLabel: { 
    width: 100,
    color: Colors.light.textMuted,
  },
  infoValue: { 
    flex: 1,
    color: Colors.light.text,
  },
  conservationStatus: {
    color: Colors.light.primary,
  },
  
  // Text content with better spacing
  habitatText: {
    lineHeight: 24,
    color: Colors.light.textSecondary,
  },
  descriptionText: {
    lineHeight: 24,
    color: Colors.light.textSecondary,
  },
  
  // Loading and error states
  centerContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.xxl * 1.5 
  },
  loadingText: { 
    marginTop: DesignTokens.spacing.lg,
    color: Colors.light.textSecondary,
  },
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
  backButton: { 
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  backButtonTextWhite: { 
    color: Colors.light.surface,
  },
  
  // Bird name section at top of content
  titleSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
    marginRight: DesignTokens.spacing.md,
  },
  mainTitle: {
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.xs,
  },
  scientificName: {
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
  },
}); 