import { router } from 'expo-router';
import React from 'react';
import { Alert, Animated, Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useFavorites } from '../hooks/useFavorites';
import type { BirdListItem } from '../types/bird';
import { BirdImage } from './BirdImage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface BirdCardProps {
  bird: BirdListItem;
  variant?: 'list' | 'grid';
  imagePriority?: 'high' | 'normal' | 'low';
  onPress?: () => void;
  showFavoriteButton?: boolean;
}

// Get screen dimensions for grid calculations
const { width: screenWidth } = Dimensions.get('window');
const gridItemWidth = (screenWidth - 32) / 2 - 8;

/**
 * Bird card component for list or grid view display
 * Implements mobile-first design with 12px border radius and sky-blue accents
 * Shows essential bird information with navigation to detail screen
 * @param bird - Bird data to display
 * @param variant - Display variant: 'list' or 'grid'
 * @param imagePriority - Image priority: 'high', 'normal', or 'low'
 * @param onPress - Optional custom press handler
 * @param showFavoriteButton - Whether to show favorite button
 * @returns JSX.Element - Pressable bird card component
 */
export const BirdCard: React.FC<BirdCardProps> = React.memo(({
  bird,
  variant = 'list',
  imagePriority = 'normal',
  onPress,
  showFavoriteButton = true
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;
  const { isFavorite, toggleFavorite, isAuthenticated, isAdding, isRemoving } = useFavorites();

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/bird/${bird.id}` as any);
    }
  };

  const handleFavoritePress = async (event: any) => {
    event.stopPropagation(); // Prevent card press
    
    if (!isAuthenticated) {
      Alert.alert(
        'Вход в систему',
        'Для добавления птиц в избранное необходимо войти в систему',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Войти', onPress: () => {
            // Navigate to favorites tab which will show auth modal
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
  };

  const displayName = bird.common_name_ru || bird.common_name_en || bird.scientific_name || 'Неизвестная птица';
  const kazakhName = bird.common_name_kz;
  const family = bird.family;
  const size = bird.size;

  const isGrid = variant === 'grid';
  const containerStyle = isGrid ? [styles.container, styles.gridContainer] : styles.container;
  const contentStyle = isGrid ? styles.gridContent : styles.listContent;
  const imageSize = isGrid ? 120 : 64;

  // Use ThemedView/ThemedText for Android, regular View/Text for iOS
  const ContentWrapper = Platform.OS === 'android' ? ThemedView : View;
  const ImageContainer = Platform.OS === 'android' ? ThemedView : View;
  const TextContainer = Platform.OS === 'android' ? ThemedView : View;
  const TextComponent = Platform.OS === 'android' ? ThemedText : Text;
  const MetadataRow = Platform.OS === 'android' ? ThemedView : View;

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable 
        style={containerStyle} 
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Открыть информацию о птице ${bird.common_name_ru || bird.common_name_en}`}
      >
        <ContentWrapper {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} style={contentStyle}>
          <ImageContainer style={isGrid ? styles.gridImageContainer : styles.imageContainer}>
            <BirdImage 
              birdId={bird.id} 
              scientificName={bird.scientific_name}
              size={imageSize} 
              priority={imagePriority}
              style={isGrid ? styles.gridImage : styles.image}
            />
            
            {/* Favorite button overlay */}
            {showFavoriteButton && (
              <Pressable
                style={styles.favoriteButton}
                onPress={handleFavoritePress}
                disabled={isAdding || isRemoving}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isFavorite(bird.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Text style={[
                  styles.favoriteIcon,
                  isFavorite(bird.id) && styles.favoriteIconActive,
                  (isAdding || isRemoving) && styles.favoriteIconDisabled
                ]}>
                  {isFavorite(bird.id) ? '❤️' : '🤍'}
                </Text>
              </Pressable>
            )}
          </ImageContainer>
          
          <TextContainer style={isGrid ? styles.gridTextContainer : styles.textContainer}>
            <TextComponent style={styles.primaryName} numberOfLines={isGrid ? 2 : 1}>
              {displayName}
            </TextComponent>
            
            {kazakhName && (
              <TextComponent style={styles.kazakhName} numberOfLines={1}>
                {kazakhName}
              </TextComponent>
            )}
            
            {!isGrid && (
              <MetadataRow style={styles.metadataRow}>
                {family && (
                  <TextComponent style={styles.metadata} numberOfLines={1}>
                    {family}
                  </TextComponent>
                )}
                {size && (
                  <TextComponent style={[styles.metadata, styles.size]} numberOfLines={1}>
                    {size}
                  </TextComponent>
                )}
              </MetadataRow>
            )}
          </TextContainer>
        </ContentWrapper>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: DesignTokens.spacing.lg,
    marginVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.card,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: Platform.OS === 'android' ? Colors.light.border : 'transparent',
    // Platform-specific shadows
    ...Platform.select({
      ios: DesignTokens.shadows.card,
      android: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  gridContainer: {
    width: gridItemWidth,
    marginHorizontal: DesignTokens.spacing.xs,
    marginVertical: DesignTokens.spacing.xs,
  },
  listContent: {
    flexDirection: 'row',
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
  },
  gridContent: {
    flexDirection: 'column',
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    minHeight: 180,
  },
  imageContainer: {
    marginRight: DesignTokens.spacing.md,
    position: 'relative',
  },
  gridImageContainer: {
    marginRight: 0,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    width: '100%',
    marginTop: DesignTokens.spacing.sm,
    alignItems: 'center',
  },
  primaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    // Keep original iOS colors, only change Android
    ...(Platform.OS === 'ios' ? {
      color: Colors.light.text,
      fontFamily: 'SF Pro Display',
    } : {
      fontFamily: 'sans-serif-medium',
    }),
  },
  kazakhName: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
    textAlign: 'center',
    // Keep original iOS colors, only change Android
    ...(Platform.OS === 'ios' ? {
      color: Colors.light.textSecondary,
      fontFamily: 'SF Pro Display',
    } : {
      fontFamily: 'sans-serif',
    }),
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    marginRight: 8,
    // Keep original iOS colors, only change Android
    ...(Platform.OS === 'ios' ? {
      color: Colors.light.textMuted,
      fontFamily: 'SF Pro Display',
    } : {
      fontFamily: 'sans-serif',
    }),
  },
  size: {
    fontWeight: '500',
  },
  gridImage: {
    width: 80,
    height: 80,
  },
  image: {
    width: 64,
    height: 64,
  },
  
  // Favorite button styles
  favoriteButton: {
    position: 'absolute',
    top: DesignTokens.spacing.xs,
    right: DesignTokens.spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.subtle,
    zIndex: 1,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteIconActive: {
    fontSize: 16,
  },
  favoriteIconDisabled: {
    opacity: 0.5,
  },
}); 