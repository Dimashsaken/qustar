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
  StyleSheet,
  View
} from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors, DesignTokens } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useBirdnetRecorder } from '../../hooks/useBirdnetRecorder';
import { useThemeColor } from '../../hooks/useThemeColor';



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
      <ThemedView {...(Platform.OS === 'android' ? { surface: 'background' as const } : {})} style={styles.content}>
        {/* Large Recording Button */}
        <RecordingButton
          isRecording={isRecording}
          onPress={handleToggleRecording}
          disabled={isDisabled}
        />
      </ThemedView>
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
}); 