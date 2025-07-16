import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useBirdSound } from '../hooks/useBirdSound';

interface BirdSoundButtonProps {
  scientificName: string | null;
  commonName?: string | null;
  size?: number;
  style?: any;
  onPress?: () => void;
}

/**
 * Button component for playing bird sounds from Xeno Canto
 * Fetches and plays bird sounds when pressed
 */
export const BirdSoundButton: React.FC<BirdSoundButtonProps> = ({
  scientificName,
  commonName,
  size = 44,
  style,
  onPress,
}) => {
  const {
    sounds,
    isLoadingSounds,
    soundsError,
    audioState,
    playSound,
    pauseSound,
    nextSound,
    refetch,
  } = useBirdSound(scientificName, commonName);

  const [hasInteracted, setHasInteracted] = useState(false);

  /**
   * Handle button press
   */
  const handlePress = async () => {
    if (onPress) {
      onPress();
    }

    setHasInteracted(true);

    // If no sounds available, show error
    if (!sounds.length && !isLoadingSounds) {
      if (soundsError) {
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить звуки птицы. Проверьте подключение к интернету и попробуйте снова.',
          [
            { text: 'Попробовать снова', onPress: () => refetch() },
            { text: 'Отмена', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Звуки недоступны',
          'Для этой птицы не найдены звуковые записи.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    // If sounds are loading, wait
    if (isLoadingSounds) {
      return;
    }

    // If audio is loading, don't allow multiple presses
    if (audioState.isLoading) {
      return;
    }

    // Show specific audio error if exists
    if (audioState.error) {
      Alert.alert(
        'Ошибка воспроизведения',
        audioState.error,
        [
          { text: 'Попробовать снова', onPress: () => playSound(audioState.currentSoundIndex) },
          { text: 'Отмена', style: 'cancel' },
        ]
      );
      return;
    }

    // Toggle play/pause
    try {
      if (audioState.isPlaying) {
        await pauseSound();
      } else {
        // Always play from the beginning or current position
        await playSound(audioState.currentSoundIndex);
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
      Alert.alert(
        'Ошибка воспроизведения',
        'Не удалось воспроизвести звук. Попробуйте снова.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handle long press to show sound options
   */
  const handleLongPress = () => {
    if (!sounds.length) return;

    if (sounds.length === 1) {
      // If only one sound, show info about it
      const sound = sounds[0];
      Alert.alert(
        'Информация о записи',
        `Качество: ${sound.quality}\n` +
        `Длительность: ${sound.length}\n` +
        `Местоположение: ${sound.location}\n` +
        `Страна: ${sound.country}\n` +
        `Записал: ${sound.recordedBy}\n` +
        `Дата: ${sound.date}`,
        [{ text: 'OK' }]
      );
    } else {
      // If multiple sounds, show options
      const options = sounds.map((sound, index) => ({
        text: `${index + 1}. ${sound.quality} - ${sound.length} (${sound.location})`,
        onPress: () => playSound(index),
      }));
      
      Alert.alert(
        'Выберите запись',
        `Доступно ${sounds.length} записей:`,
        [
          ...options,
          { text: 'Отмена', style: 'cancel' as const },
        ]
      );
    }
  };

  /**
   * Get button content based on state
   */
  const getButtonContent = () => {
    if (isLoadingSounds) {
      return <ActivityIndicator size="small" color="white" />;
    }

    if (audioState.isLoading) {
      return <ActivityIndicator size="small" color="white" />;
    }

    if (audioState.isPlaying) {
      return <Text style={[styles.buttonIcon, { fontSize: size * 0.4 }]}>⏸</Text>;
    }

    return <Text style={[styles.buttonIcon, { fontSize: size * 0.4 }]}>🔊</Text>;
  };

  /**
   * Get button color based on state
   */
  const getButtonColor = () => {
    if (soundsError && hasInteracted) {
      return Colors.light.error;
    }

    if (!sounds.length && hasInteracted && !isLoadingSounds) {
      return Colors.light.textMuted;
    }

    if (audioState.isPlaying) {
      return Colors.light.success || Colors.light.primary;
    }

    return Colors.light.primary;
  };

  /**
   * Get button accessibility label
   */
  const getAccessibilityLabel = () => {
    if (isLoadingSounds) {
      return 'Загрузка звуков птицы';
    }

    if (audioState.isPlaying) {
      return 'Остановить воспроизведение звука птицы';
    }

    if (sounds.length > 0) {
      return `Воспроизвести звук птицы (${sounds.length} записей)`;
    }

    return 'Загрузить звуки птицы';
  };

  const buttonStyle = [
    styles.button,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: getButtonColor(),
    },
    style,
  ];

  return (
    <View style={styles.container}>
      <Pressable
        style={buttonStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={isLoadingSounds || audioState.isLoading}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityRole="button"
        accessibilityHint="Нажмите для воспроизведения звука птицы, длительное нажатие для дополнительных опций"
      >
        {getButtonContent()}
      </Pressable>
      
      {/* Show next button if multiple sounds and currently playing */}
      {sounds.length > 1 && audioState.isPlaying && (
        <Pressable
          style={styles.nextButton}
          onPress={nextSound}
          accessibilityLabel="Следующая запись"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonIcon}>⏭</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.card,
    // Add better visibility on different backgrounds
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonIcon: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    // Add shadow for better visibility
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextButton: {
    position: 'absolute',
    bottom: -10,
    right: -1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...DesignTokens.shadows.card,
  },
  nextButtonIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BirdSoundButton;