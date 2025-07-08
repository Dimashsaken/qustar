/**
 * Audio Recording Tab Screen
 * Minimalistic design focused on the essentials: large microphone button and voice toggle
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useAudioDetections } from '../../hooks/useAudioDetections';
import { useAuth } from '../../hooks/useAuth';
import { useBirdnetRecorder } from '../../hooks/useBirdnetRecorder';
import { useThemeColor } from '../../hooks/useThemeColor';
import type { DetectionWithAudio } from '../../types/audio';


/**
 * Main Recording Button Component
 * Large, centered microphone button with clean design
 */
const RecordingButton = ({ 
  isRecording, 
  onPress, 
  disabled 
}: { 
  isRecording: boolean; 
  onPress: () => void; 
  disabled: boolean; 
}) => {
  const primaryColor = useThemeColor({}, 'tint');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[
          styles.recordButton,
          {
            backgroundColor: isRecording ? '#FF4444' : primaryColor,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
        onPress={disabled ? undefined : handlePress}
        disabled={disabled}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={64}
          color="white"
        />
      </Pressable>
      
      {/* Simple recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <ThemedText style={styles.recordingText}>Recording...</ThemedText>
        </View>
      )}
    </View>
  );
};

/**
 * Main Recording Screen Component
 */
export default function RecordScreen() {
  const { user, loading, isAuthenticated } = useAuth();
  const recorder = useBirdnetRecorder();
  const { detections, isLoading: detectionsLoading } = useAudioDetections();
  
  // Only redirect if loading is complete and user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [loading, isAuthenticated]);

  /**
   * Handle recording start/stop toggle
   */
  const handleToggleRecording = async () => {
    if (!user) return;

    if (recorder.recordingStatus === 'recording') {
      // Stop recording
      try {
        await recorder.stop(user.id);
      } catch (error) {
        console.error('Recording stop failed:', error);
        Alert.alert(
          'Processing Failed',
          'Unable to process recording. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Start recording
      try {
        await recorder.start();
      } catch (error) {
        console.error('Recording start failed:', error);
        Alert.alert(
          'Recording Failed',
          'Unable to start recording. Please check microphone permissions.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.centerContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  const isRecording = recorder.recordingStatus === 'recording';
  const isDisabled = recorder.recordingStatus === 'processing';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <ThemedView {...(Platform.OS === 'android' ? { surface: 'surface' as const } : {})} style={styles.header}>
        <ThemedText style={styles.title}>Запись</ThemedText>
      </ThemedView>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Recording Button */}
        <RecordingButton
          isRecording={isRecording}
          onPress={handleToggleRecording}
          disabled={isDisabled}
        />

        {/* Status Message */}
        {recorder.recordingStatus === 'processing' && (
          <ThemedText style={styles.statusText}>
            🔍 Обрабатываем запись...
          </ThemedText>
        )}

        {recorder.recordingStatus === 'completed' && (
          <ThemedText style={styles.statusText}>
            ✅ Запись обработана! Проверьте результаты ниже.
          </ThemedText>
        )}

        {/* Detections Section */}
        <View style={styles.detectionsSection}>
          <ThemedText style={styles.detectionsTitle}>
            🎵 История обнаружений
          </ThemedText>
          
          {detectionsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.statusText}>Загрузка обнаружений...</Text>
            </View>
          ) : detections.length > 0 ? (
            <View style={styles.detectionsContainer}>
              {detections.slice(0, 5).map((item: DetectionWithAudio, index: number) => (
                <Pressable 
                  key={`${item.detection.id}-${index}`} 
                  style={styles.detectionItem}
                  onPress={() => {
                    // Navigate to bird detail if we can match the species
                    const speciesParts = item.detection.species.split('_');
                    if (speciesParts.length >= 2) {
                      router.push(`/bird/search?species=${encodeURIComponent(item.detection.species)}`);
                    }
                  }}
                >
                  <Text style={styles.detectionSpecies}>
                    {item.detection.species.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.detectionConfidence}>
                    Уверенность: {Math.round(item.detection.confidence * 100)}%
                  </Text>
                  <Text style={styles.detectionTime}>
                    {new Date(item.audioUpload.recorded_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </Pressable>
              ))}
              
              {detections.length > 5 && (
                <Pressable 
                  style={styles.viewMoreButton}
                  onPress={() => {
                    // TODO: Navigate to full detections history page
                    Alert.alert('История обнаружений', 'Полная история скоро будет доступна!');
                  }}
                >
                  <Text style={styles.viewMoreText}>
                    Посмотреть все ({detections.length}) →
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                🎤 Пока нет записей
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Нажмите кнопку записи, чтобы начать определение птиц по голосу
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Changed to pure white
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: '#FFFFFF', // Changed to pure white
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: '#FFFFFF', // Ensure content area is also white
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xl * 2,
  },
  recordButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.card,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignTokens.spacing.lg,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: DesignTokens.spacing.sm,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl * 2,
  },
  statusText: {
    textAlign: 'center',
    marginTop: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
  },
  detectionsSection: {
    marginTop: DesignTokens.spacing.xl,
    width: '100%',
  },
  detectionsContainer: {
    width: '100%',
    marginTop: DesignTokens.spacing.md,
  },
  detectionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: DesignTokens.spacing.sm,
    color: Colors.light.text,
    textAlign: 'center',
  },
  detectionItem: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...DesignTokens.shadows.subtle,
  },
  detectionSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  detectionConfidence: {
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: DesignTokens.spacing.xs,
    fontWeight: '500',
  },
  detectionTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: DesignTokens.spacing.xs,
  },
  loadingContainer: {
    paddingVertical: DesignTokens.spacing.md,
    alignItems: 'center',
  },
  viewMoreButton: {
    marginTop: DesignTokens.spacing.sm,
    alignSelf: 'center',
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  viewMoreText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    paddingVertical: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: DesignTokens.spacing.md,
  },
}); 