/**
 * Audio Recording Tab Screen
 * Enhanced with better error handling, permission status, and user guidance
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { AudioDetectionGroup } from '../../components/AudioDetectionGroup';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useAudioDetections } from '../../hooks/useAudioDetections';
import { useAuth } from '../../hooks/useAuth';
import { useBirdnetRecorder } from '../../hooks/useBirdnetRecorder';
import { useThemeColor } from '../../hooks/useThemeColor';

/**
 * Permission Status Banner Component
 * Shows current microphone permission status and guidance
 */
const PermissionBanner = ({ 
  permissionStatus,
  onRequestPermissions 
}: { 
  permissionStatus?: string;
  onRequestPermissions: () => void;
}) => {
  if (!permissionStatus || permissionStatus === 'granted') {
    return null;
  }

  const getBannerConfig = () => {
    switch (permissionStatus) {
      case 'denied':
        return {
          color: '#FF6B35',
          icon: 'warning' as const,
          title: 'Microphone Access Required',
          message: 'Grant microphone permission to record bird sounds',
          action: 'Grant Permission',
        };
      case 'blocked':
        return {
          color: '#E74C3C',
          icon: 'ban' as const,
          title: 'Microphone Access Blocked',
          message: 'Please enable microphone access in device settings',
          action: 'Open Settings',
        };
      default:
        return {
          color: '#3498DB',
          icon: 'information-circle' as const,
          title: 'Checking Permissions',
          message: 'Verifying microphone access...',
          action: null,
        };
    }
  };

  const config = getBannerConfig();

  return (
    <View style={[styles.permissionBanner, { borderLeftColor: config.color }]}>
      <View style={styles.permissionContent}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <View style={styles.permissionText}>
          <Text style={[styles.permissionTitle, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.permissionMessage}>
            {config.message}
          </Text>
        </View>
      </View>
      {config.action && (
        <Pressable
          style={[styles.permissionButton, { backgroundColor: config.color }]}
          onPress={onRequestPermissions}
        >
          <Text style={styles.permissionButtonText}>{config.action}</Text>
        </Pressable>
      )}
    </View>
  );
};

/**
 * Error Display Component
 * Shows detailed error information with recovery actions
 */
const ErrorDisplay = ({ 
  error,
  onRetry,
  onDismiss 
}: { 
  error: any;
  onRetry?: () => void;
  onDismiss: () => void;
}) => {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorHeader}>
        <Ionicons name="alert-circle" size={24} color="#E74C3C" />
        <Text style={styles.errorTitle}>{error.message}</Text>
      </View>
      
      {error.details && (
        <Text style={styles.errorDetails}>{error.details}</Text>
      )}
      
      <View style={styles.errorActions}>
        <Pressable
          style={[styles.errorButton, styles.dismissButton]}
          onPress={onDismiss}
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </Pressable>
        
        {error.isRecoverable && onRetry && (
          <Pressable
            style={[styles.errorButton, styles.retryButton]}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

/**
 * Main Recording Button Component
 * Enhanced with better visual feedback and accessibility
 */
const RecordingButton = ({ 
  isRecording, 
  onPress, 
  disabled,
  permissionStatus 
}: { 
  isRecording: boolean; 
  onPress: () => void; 
  disabled: boolean;
  permissionStatus?: string;
}) => {
  const primaryColor = useThemeColor({}, 'tint');
  
  const getButtonState = () => {
    if (disabled) return { color: '#BDC3C7', opacity: 0.5 };
    if (permissionStatus && permissionStatus !== 'granted') {
      return { color: '#E74C3C', opacity: 0.7 };
    }
    return { 
      color: isRecording ? '#FF4444' : primaryColor, 
      opacity: 1 
    };
  };

  const buttonState = getButtonState();
  const canRecord = !disabled && permissionStatus === 'granted';

  const handlePress = () => {
    if (!canRecord) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[
          styles.recordButton,
          {
            backgroundColor: buttonState.color,
            opacity: buttonState.opacity,
          }
        ]}
        onPress={handlePress}
        disabled={!canRecord}
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
        accessibilityHint="Records bird sounds for identification"
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={64}
          color="white"
        />
      </Pressable>
      
      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <ThemedText style={styles.recordingText}>Recording...</ThemedText>
        </View>
      )}
      
      {/* Status hints */}
      {!canRecord && !disabled && (
        <ThemedText style={styles.statusHint}>
          {permissionStatus === 'denied' || permissionStatus === 'blocked' 
            ? '🎙️ Microphone access needed'
            : '🎙️ Checking permissions...'
          }
        </ThemedText>
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
  const { detections, isLoading: detectionsLoading, forceRefetch, getGroupedDetections } = useAudioDetections();
  
  // Only redirect if loading is complete and user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [loading, isAuthenticated]);

  // Force refresh detections when recording is completed
  useEffect(() => {
    if (recorder.recordingStatus === 'completed') {
      console.log('🔄 Recording completed, refreshing detections...');
      forceRefetch();
    }
  }, [recorder.recordingStatus, forceRefetch]);

  /**
   * Handle recording start/stop toggle with better error handling
   */
  const handleToggleRecording = async () => {
    if (!user) return;

    if (recorder.recordingStatus === 'recording') {
      // Stop recording
      try {
        await recorder.stop(user.id);
      } catch (error) {
        console.error('Recording stop failed:', error);
        // Error is now handled by the hook's error state
      }
    } else {
      // Start recording
      try {
        await recorder.start();
      } catch (error) {
        console.error('Recording start failed:', error);
        // Error is now handled by the hook's error state
      }
    }
  };

  /**
   * Handle permission request
   */
  const handleRequestPermissions = async () => {
    if (recorder.requestPermissions) {
      await recorder.requestPermissions();
    }
  };

  /**
   * Handle error retry
   */
  const handleRetryAfterError = () => {
    if (recorder.reset) {
      recorder.reset();
    }
  };

  /**
   * Handle error dismissal
   */
  const handleDismissError = () => {
    if (recorder.reset) {
      recorder.reset();
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
  
  // Get grouped detections for organized display
  const groupedDetections = getGroupedDetections();

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
        {/* Permission Banner */}
        <PermissionBanner
          permissionStatus={recorder.permissionStatus}
          onRequestPermissions={handleRequestPermissions}
        />

        {/* Error Display */}
        <ErrorDisplay
          error={recorder.lastError}
          onRetry={handleRetryAfterError}
          onDismiss={handleDismissError}
        />

        {/* Large Recording Button */}
        <RecordingButton
          isRecording={isRecording}
          onPress={handleToggleRecording}
          disabled={isDisabled}
          permissionStatus={recorder.permissionStatus}
        />

        {/* Enhanced Status Messages */}
        {recorder.recordingStatus === 'processing' && (
          <View style={styles.statusContainer}>
            <ThemedText style={styles.statusText}>
              Обрабатываем запись...
            </ThemedText>
            <ThemedText style={styles.statusSubtext}>
              Это может занять несколько секунд
            </ThemedText>
          </View>
        )}

        {recorder.recordingStatus === 'completed' && (
          <View style={styles.statusContainer}>
            <ThemedText style={[styles.statusText, { color: '#27AE60' }]}>
              Запись обработана!
            </ThemedText>
            <ThemedText style={styles.statusSubtext}>
              Проверьте результаты ниже
            </ThemedText>
          </View>
        )}

        {/* Detections Section */}
        <View style={styles.detectionsSection}>
          <ThemedText style={styles.detectionsTitle}>
            История обнаружений
          </ThemedText>
          
          {detectionsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.statusText}>Загрузка обнаружений...</Text>
            </View>
          ) : groupedDetections.length > 0 ? (
            <>
              <View style={styles.detectionsContainer}>
                {groupedDetections.slice(0, 3).map((group) => (
                  <AudioDetectionGroup
                    key={group.audioId}
                    audioId={group.audioId}
                    detections={group.detections}
                  />
                ))}
                
                {groupedDetections.length > 3 && (
                  <Pressable 
                    style={styles.viewMoreButton}
                    onPress={() => {
                      router.push('/detections-full');
                    }}
                  >
                    <Text style={styles.viewMoreText}>
                      Посмотреть все ({groupedDetections.length} записей) →
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Пока нет записей
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    paddingTop: 10,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl * 2,
  },
  
  // Permission Banner Styles
  permissionBanner: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: DesignTokens.spacing.md,
    marginVertical: DesignTokens.spacing.md,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  permissionText: {
    flex: 1,
    marginLeft: DesignTokens.spacing.sm,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionMessage: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.8,
  },
  permissionButton: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Error Display Styles
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    borderRadius: 8,
    padding: DesignTokens.spacing.md,
    marginVertical: DesignTokens.spacing.md,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginLeft: DesignTokens.spacing.sm,
    flex: 1,
  },
  errorDetails: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: DesignTokens.spacing.md,
  },
  errorActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
  },
  errorButton: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: 6,
    flex: 1,
  },
  dismissButton: {
    backgroundColor: '#BDC3C7',
  },
  retryButton: {
    backgroundColor: '#E74C3C',
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Recording Button Styles
  buttonContainer: {
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.xl,
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
  statusHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: DesignTokens.spacing.sm,
    opacity: 0.7,
  },

  // Status Message Styles
  statusContainer: {
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.md,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  statusSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    marginTop: 4,
  },

  // Detections Section Styles (keeping existing)
  detectionsSection: {
    marginTop: DesignTokens.spacing.xl,
    width: '100%',
  },
  detectionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: DesignTokens.spacing.md,
    color: Colors.light.text,
  },
  loadingContainer: {
    padding: DesignTokens.spacing.lg,
    alignItems: 'center',
  },
  detectionsContainer: {
    gap: DesignTokens.spacing.sm,
  },
  viewMoreButton: {
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: DesignTokens.spacing.sm,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  emptyStateContainer: {
    padding: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 