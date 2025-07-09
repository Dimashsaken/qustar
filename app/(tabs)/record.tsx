/**
 * Audio Recording Tab Screen
 * Enhanced with better error handling, permission status, and user guidance
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

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
  // Only show banner for blocked permissions - not for denied or undefined
  if (permissionStatus !== 'blocked') {
    return null;
  }

  const getBannerConfig = () => {
    // Only blocked permissions reach this point
    return {
      color: '#E74C3C',
      icon: 'ban' as const,
      title: 'Доступ к микрофону заблокирован',
      message: 'Откройте настройки устройства и разрешите доступ к микрофону',
      action: 'Открыть настройки',
    };
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
    if (permissionStatus === 'blocked') {
      return { color: '#E74C3C', opacity: 0.7 };
    }
    return { 
      color: isRecording ? '#FF4444' : primaryColor, 
      opacity: 1 
    };
  };

  const buttonState = getButtonState();
  // Allow button press unless disabled or permissions are permanently blocked
  // The hook will handle permission requests intelligently
  const canRecord = !disabled && permissionStatus !== 'blocked';

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
      {!canRecord && !disabled && permissionStatus === 'blocked' && (
        <ThemedText style={styles.statusHint}>
          🎙️ Необходим доступ к микрофону
        </ThemedText>
      )}
    </View>
  );
};

/**
 * Recording Guide Modal Component
 * Shows simple instructions for optimal bird recording with bottom sheet animation
 */
const RecordingGuideModal = ({ 
  visible, 
  onClose 
}: { 
  visible: boolean; 
  onClose: () => void;
}) => {
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const bottomSheetTranslateY = useSharedValue(500);

  /**
   * Handle animation when visibility changes
   */
  useEffect(() => {
    if (visible) {
      // Fade in background
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      // Slide up bottom sheet
      bottomSheetTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      // Fade out background
      backgroundOpacity.value = withTiming(0, { duration: 200 });
      // Slide down bottom sheet
      bottomSheetTranslateY.value = withSpring(500, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [visible]);

  /**
   * Animated style for background opacity
   */
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  /**
   * Animated style for bottom sheet slide up
   */
  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: bottomSheetTranslateY.value },
      ],
    };
  });

  return (
    <Modal
      visible={visible}
      animationType="none" // Disable default animation
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Animated background area */}
        <Animated.View style={[styles.modalBackgroundArea, backgroundAnimatedStyle]}>
          <Pressable style={styles.modalBackgroundPressable} onPress={onClose} />
        </Animated.View>
        
        {/* Animated bottom sheet content */}
        <Animated.View style={[styles.modalBottomSheet, bottomSheetAnimatedStyle]}>
          {/* Drag handle */}
          <View style={styles.modalDragHandle} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Как записывать птиц</Text>
            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Simple Guide Content */}
          <View style={styles.simpleModalContent}>
            <View style={styles.simpleTip}>
              <Text style={styles.simpleTipNumber}>1</Text>
              <Text style={styles.simpleTipText}>Записывайте 10-30 секунд в тихом месте</Text>
            </View>
            
            <View style={styles.simpleTip}>
              <Text style={styles.simpleTipNumber}>2</Text>
              <Text style={styles.simpleTipText}>Лучшее время: утром (5:00-10:00) или вечером (17:00-19:00)</Text>
            </View>
            
            <View style={styles.simpleTip}>
              <Text style={styles.simpleTipNumber}>3</Text>
              <Text style={styles.simpleTipText}>Направьте телефон в сторону звука птицы</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Main Recording Screen Component
 */
export default function RecordScreen() {
  const { user, loading, isAuthenticated } = useAuth();
  const recorder = useBirdnetRecorder();
  const { detections, isLoading: detectionsLoading, forceRefetch, getGroupedDetections } = useAudioDetections();
  const [isRecordingGuideModalVisible, setIsRecordingGuideModalVisible] = useState(false);
  const [showNoBirdsMessage, setShowNoBirdsMessage] = useState(false);
  const [detectionCountBeforeRecording, setDetectionCountBeforeRecording] = useState(0);
  
  // Use refs to capture current values without causing dependency loops
  const detectionsRef = useRef(detections);
  const forceRefetchRef = useRef(forceRefetch);
  const detectionCountRef = useRef(detectionCountBeforeRecording);
  
  // Update refs when values change
  useEffect(() => {
    detectionsRef.current = detections;
  }, [detections]);
  
  useEffect(() => {
    forceRefetchRef.current = forceRefetch;
  }, [forceRefetch]);
  
  useEffect(() => {
    detectionCountRef.current = detectionCountBeforeRecording;
  }, [detectionCountBeforeRecording]);
  
  // Only redirect if loading is complete and user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [loading, isAuthenticated]);

  // Check permission status without requesting on page open
  useEffect(() => {
    let mounted = true;

    const checkPermissionsOnMount = async () => {
      if (!loading && isAuthenticated && mounted && recorder.checkPermissions) {
        // Just check current status, don't request
        await recorder.checkPermissions();
      }
    };

    checkPermissionsOnMount();

    return () => {
      mounted = false;
    };
  }, [loading, isAuthenticated]);

  // Monitor for recording completion and check for new detections after 3 seconds
  useEffect(() => {
    if (recorder.recordingStatus === 'completed') {
      console.log('🔄 Recording completed, will check for new detections in 3 seconds...');
      
      // Single timeout check after 3 seconds
      const timeoutId = setTimeout(async () => {
        await forceRefetchRef.current();
        
        // Get fresh detection count after refetch
        setTimeout(() => {
          const currentCount = detectionsRef.current.length;
          const beforeCount = detectionCountRef.current;
          console.log(`Detection count: ${beforeCount} -> ${currentCount}`);
          
          if (currentCount === beforeCount) {
            // No new detections found
            console.log('⚠️ No new birds detected');
            setShowNoBirdsMessage(true);
          } else {
            console.log(`✅ Found ${currentCount - beforeCount} new birds`);
            setShowNoBirdsMessage(false);
          }
        }, 500); // Small delay to let the refetch complete
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [recorder.recordingStatus]); // Only depend on recording status

  /**
   * Handle recording start/stop toggle with permission checking
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
      // Start recording - reset no birds message and capture current detection count
      // The hook will handle permission checking internally now
      setShowNoBirdsMessage(false);
      setDetectionCountBeforeRecording(detections.length);
      console.log(`📊 Capturing detection count before recording: ${detections.length}`);
      
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
        <Pressable 
          onPress={() => setIsRecordingGuideModalVisible(true)}
          style={styles.helpButton}
        >
          <Ionicons name="help-circle" size={32} color={Colors.light.tint} />
        </Pressable>
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
            <ThemedText style={[styles.statusText, { color: showNoBirdsMessage ? '#F39C12' : 'black' }]}>
              {showNoBirdsMessage ? 'Птицы не обнаружены' : 'Запись обработана!'}
            </ThemedText>
            <ThemedText style={styles.statusSubtext}>
              {showNoBirdsMessage ? 'Попробуйте записать в другом месте или времени' : 'Проверьте результаты ниже'}
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
              <Ionicons 
                name="mic-outline" 
                size={64} 
                color={Colors.light.tint} 
                style={styles.emptyStateIcon} 
              />
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
      <RecordingGuideModal
        visible={isRecordingGuideModalVisible}
        onClose={() => setIsRecordingGuideModalVisible(false)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    paddingTop: 10,
  },
  helpButton: {
    padding: 8,
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
  emptyStateIcon: {
    marginBottom: DesignTokens.spacing.md,
    opacity: 0.6,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalBackgroundArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  modalBackgroundPressable: {
    flex: 1,
  },
  modalBottomSheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '40%',
    paddingTop: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: DesignTokens.spacing.sm,
  },
  modalCloseIcon: {
    fontSize: 24,
    color: Colors.light.text,
  },

  // Simple Modal Styles
  simpleModalContent: {
    flex: 1,
    paddingVertical: DesignTokens.spacing.lg,
  },
  simpleTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing.xl,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  simpleTipNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginRight: DesignTokens.spacing.md,
    minWidth: 32,
  },
  simpleTipText: {
    fontSize: 18,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 24,
  },
}); 