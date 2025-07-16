import { useQuery } from '@tanstack/react-query';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { XenoCantoApi, XenoCantoBirdSound } from '../lib/xenoCantoApi';

/**
 * Audio playback state
 */
export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number | null;
  position: number | null;
  currentSoundIndex: number;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseBirdSoundReturn {
  sounds: XenoCantoBirdSound[];
  isLoadingSounds: boolean;
  soundsError: string | null;
  audioState: AudioState;
  playSound: (index?: number) => Promise<void>;
  pauseSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  nextSound: () => Promise<void>;
  previousSound: () => Promise<void>;
  refetch: () => void;
}

/**
 * Hook for managing bird sounds from Xeno Canto API
 * @param scientificName - Scientific name of the bird
 * @param commonName - Common name of the bird (fallback)
 * @returns UseBirdSoundReturn - Hook return object
 */
export const useBirdSound = (
  scientificName: string | null,
  commonName: string | null = null
): UseBirdSoundReturn => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    duration: null,
    position: null,
    currentSoundIndex: 0,
    error: null,
  });

  // Fetch bird sounds from Xeno Canto API
  const {
    data: sounds = [],
    isLoading: isLoadingSounds,
    error: soundsError,
    refetch,
  } = useQuery({
    queryKey: ['birdSounds', scientificName, commonName],
    queryFn: async () => {
      if (!scientificName && !commonName) {
        return [];
      }

      try {
        // Try scientific name first, then common name
        if (scientificName) {
          const results = await XenoCantoApi.searchBySpecies(scientificName);
          if (results.length > 0) {
            return results;
          }
        }

        if (commonName) {
          const results = await XenoCantoApi.searchByCommonName(commonName);
          return results;
        }

        return [];
      } catch (error) {
        console.error('Failed to fetch bird sounds:', error);
        throw error;
      }
    },
    enabled: !!(scientificName || commonName),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  /**
   * Initialize audio settings
   */
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
          // iOS specific settings to prevent seeking issues
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();
  }, []);

  /**
   * Cleanup audio when component unmounts
   */
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        const cleanup = async () => {
          try {
            const status = await soundRef.current!.getStatusAsync();
            if (status.isLoaded) {
              if (status.isPlaying) {
                await soundRef.current!.stopAsync();
              }
              await soundRef.current!.unloadAsync();
            }
          } catch (error) {
            console.warn('Error during cleanup:', error);
          }
        };
        cleanup();
      }
    };
  }, []);

  /**
   * Handle audio playback status updates
   */
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setAudioState(prev => ({
        ...prev,
        isPlaying: status.isPlaying,
        duration: status.durationMillis || null,
        position: status.positionMillis || null,
        isLoading: false,
        error: null, // Clear any previous errors on successful status update
      }));

      // Handle when sound finishes playing
      if (status.didJustFinish) {
        setAudioState(prev => ({
          ...prev,
          isPlaying: false,
          position: 0,
        }));
      }
    } else if (status.error) {
      console.error('Audio playback status error:', status.error);
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: `Audio playback error: ${status.error}`,
      }));
    }
  }, []);

  /**
   * Play a specific sound or the current sound
   */
  const playSound = useCallback(async (index?: number) => {
    if (!sounds.length) return;

    const targetIndex = index !== undefined ? index : audioState.currentSoundIndex;
    if (targetIndex < 0 || targetIndex >= sounds.length) return;

    try {
      setAudioState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        currentSoundIndex: targetIndex,
      }));

      // Always stop and unload previous sound completely
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await soundRef.current.stopAsync();
            }
            await soundRef.current.unloadAsync();
          }
        } catch (unloadError) {
          console.warn('Error unloading previous sound:', unloadError);
        }
        soundRef.current = null;
      }

      // Small delay to ensure iOS audio session is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load and play new sound
      const sound = await Audio.Sound.createAsync(
        { uri: sounds[targetIndex].fileUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
          // iOS specific settings to prevent seeking issues
          progressUpdateIntervalMillis: 100,
          positionMillis: 0,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound.sound;
    } catch (error) {
      console.error('Failed to play sound:', error);
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to play sound',
      }));
    }
  }, [sounds, audioState.currentSoundIndex, onPlaybackStatusUpdate]);

  /**
   * Pause current sound
   */
  const pauseSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
        }
      } catch (error) {
        console.error('Failed to pause sound:', error);
      }
    }
  }, []);

  /**
   * Stop current sound
   */
  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.stopAsync();
          }
          // Reset position to beginning
          await soundRef.current.setPositionAsync(0);
        }
        setAudioState(prev => ({
          ...prev,
          isPlaying: false,
          position: 0,
        }));
      } catch (error) {
        console.error('Failed to stop sound:', error);
      }
    }
  }, []);

  /**
   * Play next sound
   */
  const nextSound = useCallback(async () => {
    if (sounds.length > 1) {
      const nextIndex = (audioState.currentSoundIndex + 1) % sounds.length;
      await playSound(nextIndex);
    }
  }, [sounds.length, audioState.currentSoundIndex, playSound]);

  /**
   * Play previous sound
   */
  const previousSound = useCallback(async () => {
    if (sounds.length > 1) {
      const prevIndex = audioState.currentSoundIndex === 0 
        ? sounds.length - 1 
        : audioState.currentSoundIndex - 1;
      await playSound(prevIndex);
    }
  }, [sounds.length, audioState.currentSoundIndex, playSound]);

  return {
    sounds,
    isLoadingSounds,
    soundsError: soundsError?.message || null,
    audioState,
    playSound,
    pauseSound,
    stopSound,
    nextSound,
    previousSound,
    refetch,
  };
};