/**
 * Enhanced Audio Level Visualizer Component
 * Shows simulated real-time audio levels with animated bars during recording
 * Designed to match QuStar app's visual system
 */

import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Colors, DesignTokens } from '../constants/Colors';
import { ThemedText } from './ThemedText';

const ANIMATION_INTERVAL = 150;  // ms between bar height changes
const BAR_COUNT = 24;           // number of audio level bars
const MAX_BAR_HEIGHT = 48;      // px inside the container

interface AudioToggleProps {
  /** Color for active/recording bars */
  activeBarColor?: string;
  /** Color for inactive bars */
  inactiveBarColor?: string;
  /** Number of bars to display */
  barCount?: number;
  /** Whether recording is active (controlled from parent) */
  isRecording?: boolean;
  /** Callback when toggle is pressed */
  onToggle?: (active: boolean) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Audio level visualizer with simulated microphone levels
 */
export const AudioToggle: React.FC<AudioToggleProps> = ({
  activeBarColor = Colors.light.primary,
  inactiveBarColor = Colors.light.border,
  barCount = BAR_COUNT,
  isRecording = false,
  onToggle,
  disabled = false,
}) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  /** Shared values for each bar's animation */
  const barHeights = useMemo(
    () => Array.from({ length: barCount }, () => useSharedValue(0)),
    [barCount]
  );
  
  /** Animation for pulsing effect when recording */
  const pulseAnimation = useSharedValue(1);

  /** Base multipliers for each bar to create variation */
  const multipliers = useMemo(
    () => Array.from({ length: barCount }, () => 0.3 + Math.random() * 0.7),
    [barCount],
  );

  /** Ask for microphone permission using Expo Audio */
  const ensurePermission = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      const granted = permission.status === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /** Start pulse animation when recording */
  useEffect(() => {
    if (isRecording) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording, pulseAnimation]);

  /** Animate bars to simulate audio levels when recording */
  useEffect(() => {
    if (isRecording && !disabled) {
      // Ensure permission on first recording
      ensurePermission();

      // Start bar animations
      const animateBar = (index: number) => {
        const delay = index * 20; // Stagger the animations
        const baseHeight = 0.2 + Math.random() * 0.8; // Random base level
        
        barHeights[index].value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(baseHeight * multipliers[index], { duration: ANIMATION_INTERVAL }),
              withTiming((0.1 + Math.random() * 0.9) * multipliers[index], { duration: ANIMATION_INTERVAL })
            ),
            -1,
            false
          )
        );
      };

      // Start all bar animations
      barHeights.forEach((_, index) => animateBar(index));
    } else {
      // Stop animations and reset bars
      barHeights.forEach((barHeight) => {
        barHeight.value = withTiming(0, { duration: 300 });
      });
    }
  }, [isRecording, disabled, barHeights, multipliers, ensurePermission]);

  /** Render animated bars */
  const renderBars = () =>
    barHeights.map((barHeight, index) => {
      const animatedStyle = useAnimatedStyle(() => ({
        height: 2 + barHeight.value * MAX_BAR_HEIGHT,
        backgroundColor: isRecording ? activeBarColor : inactiveBarColor,
        opacity: disabled ? 0.5 : 1,
      }));

      return <Animated.View key={index} style={[styles.bar, animatedStyle]} />;
    });

  /** Container animation style */
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    onToggle?.(!isRecording);
  };

  return (
    <View style={styles.wrapper}>
      {/* Status indicator */}
      {isRecording && (
        <View style={styles.statusContainer}>
          <View style={[styles.recordingDot, { backgroundColor: activeBarColor }]} />
          <ThemedText style={[styles.statusText, { color: activeBarColor }]}>
            Listening...
          </ThemedText>
        </View>
      )}

      {/* Audio visualizer */}
      <Pressable
        style={[
          styles.container,
          disabled && styles.disabledContainer,
          isRecording && styles.activeContainer,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={isRecording ? 'Stop audio monitoring' : 'Start audio monitoring'}
        accessibilityHint="Visualizes audio levels during recording"
      >
        <Animated.View style={[styles.barsContainer, containerAnimatedStyle]}>
          <View style={styles.barRow}>{renderBars()}</View>
        </Animated.View>

        {/* Center icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={isRecording ? 'stop' : 'radio-outline'}
            size={16}
            color={isRecording ? activeBarColor : Colors.light.tabIconDefault}
          />
        </View>
      </Pressable>

      {/* Help text */}
      {!isRecording && !disabled && (
        <ThemedText style={styles.helpText}>
          Audio visualization
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.md,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: DesignTokens.spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },

  container: {
    position: 'relative',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.card,
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...DesignTokens.shadows.subtle,
  },
  activeContainer: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  disabledContainer: {
    opacity: 0.5,
    backgroundColor: Colors.light.border,
  },

  barsContainer: {
    alignItems: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT,
    paddingHorizontal: DesignTokens.spacing.sm,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
    minHeight: 2,
  },

  iconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  helpText: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    marginTop: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
}); 