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

  // Fetch bird sounds from Xeno Canto API with improved error handling
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

      console.log('Fetching bird sounds for:', { scientificName, commonName });

      try {
        let results: XenoCantoBirdSound[] = [];
        
        // Try scientific name first with improved matching
        if (scientificName) {
          console.log('Searching by scientific name:', scientificName);
          results = await XenoCantoApi.searchBySpecies(scientificName);
          
          if (results.length > 0) {
            console.log(`Found ${results.length} sounds by scientific name`);
            return results;
          } else {
            console.log('No sounds found by scientific name, trying common name...');
          }
        }

        // Fallback to common name if scientific name fails
        if (commonName) {
          console.log('Searching by common name:', commonName);
          results = await XenoCantoApi.searchByCommonName(commonName);
          
          if (results.length > 0) {
            console.log(`Found ${results.length} sounds by common name`);
            return results;
          } else {
            console.log('No sounds found by common name either');
          }
        }

        // If both fail, try alternative approaches
        if (scientificName && results.length === 0) {
          console.log('Trying alternative search strategies...');
          
          // Try searching just the species name (second word)
          const parts = scientificName.split(' ');
          if (parts.length >= 2) {
            const speciesOnly = parts[1];
            console.log('Trying species name only:', speciesOnly);
            results = await XenoCantoApi.searchByCommonName(speciesOnly);
            
            if (results.length > 0) {
              console.log(`Found ${results.length} sounds by species name only`);
              return results;
            }
          }
        }

        console.log('No bird sounds found for any search strategy');
        return [];
      } catch (error) {
        console.error('Failed to fetch bird sounds:', error);
        // Don't throw error, just return empty array to prevent app crash
        return [];
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

      const selectedSound = sounds[targetIndex];
      console.log('Attempting to play sound:', selectedSound.fileUrl);

      // Validate URL format
      if (!selectedSound.fileUrl || !selectedSound.fileUrl.startsWith('http')) {
        throw new Error('Invalid audio file URL');
      }

      // Load and play new sound with better error handling
      const sound = await Audio.Sound.createAsync(
        { uri: selectedSound.fileUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
          // iOS specific settings to prevent seeking issues
          progressUpdateIntervalMillis: 100,
          positionMillis: 0,
          // Add timeout and retry options
          androidImplementation: 'MediaPlayer',
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound.sound;
      
      // Verify sound loaded successfully
      const status = await sound.sound.getStatusAsync();
      if (!status.isLoaded) {
        throw new Error('Sound failed to load properly');
      }

    } catch (error) {
      console.error('Failed to play sound:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to play sound';
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('-11850') || errorMsg.includes('AVFoundationErrorDomain')) {
        errorMessage = 'Audio file format not supported or corrupted';
      } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorMsg.includes('format') || errorMsg.includes('codec')) {
        errorMessage = 'Audio format not supported.';
      } else if (errorMsg.includes('Invalid') || errorMsg.includes('url')) {
        errorMessage = 'Invalid audio file URL.';
      } else if (errorMsg.includes('timeout')) {
        errorMessage = 'Audio loading timeout. Please try again.';
      }

      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: errorMessage,
      }));

      // Try next sound if available and this isn't a network issue
      if (sounds.length > 1 && targetIndex < sounds.length - 1 && !errorMsg.includes('network')) {
        console.log('Trying next sound due to playback error...');
        setTimeout(() => playSound(targetIndex + 1), 1000);
      }
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