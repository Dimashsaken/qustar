/**
 * BirdNET Audio Recording Hook
 * Handles audio recording, uploading to Supabase, and triggering BirdNET analysis
 * Uses expo-av's Audio.Recording API
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import type { AudioRecorderHook, PermissionStatus, RecordingError, RecordingStatus } from '../types/audio';
import { useAuth } from './useAuth';

/**
 * Hook for recording audio, uploading, and triggering BirdNET analysis
 * Uses expo-av's Audio.Recording API
 * @returns Audio recorder interface with recording controls and status
 */
export const useBirdnetRecorder = (): AudioRecorderHook => {
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | undefined>(undefined);
  const [lastError, setLastError] = useState<RecordingError | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Custom recording options for bird sounds, based on HIGH_QUALITY preset
  const BIRD_RECORDING_OPTIONS = {
    ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
    android: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android, sampleRate: 48000, numberOfChannels: 1 },
    ios: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios, sampleRate: 48000, numberOfChannels: 1 },
    web: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.web },
    isMeteringEnabled: false,
  };

  /** Check current microphone permission status */
  const checkPermissions = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
      return status as PermissionStatus;
    } catch {
      setPermissionStatus('undetermined');
      return 'undetermined';
    }
  }, []);

  /** Request microphone permissions */
  const requestPermissions = useCallback(async (showAlerts: boolean = true): Promise<boolean> => {
    try {
      const { status, granted } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
      if (!granted && showAlerts) {
        Alert.alert('Разрешение необходимо', 'Доступ к микрофону нужен для записи звуков птиц. Пожалуйста, разрешите доступ в настройках устройства.', [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
        ]);
      }
      return granted;
    } catch (error) {
      setLastError({ code: 'PERMISSION_ERROR', message: 'Failed to request microphone permissions', details: error instanceof Error ? error.message : 'Unknown error', isRecoverable: true });
      return false;
    }
  }, []);

  /** Start audio recording */
  const start = useCallback(async () => {
    try {
      setLastError(null);
      if (!user) throw new Error('User must be authenticated to record');
      const currentStatus = await checkPermissions();
      if (currentStatus !== 'granted') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) throw new Error('Microphone permission required');
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(BIRD_RECORDING_OPTIONS, (status) => {
        setDuration(status.durationMillis || 0);
      });
      setRecording(newRecording);
      setRecordingStatus('recording');
      setUri(null);
      timerRef.current = setInterval(async () => {
        if (newRecording) {
          const status = await newRecording.getStatusAsync();
          setDuration(status.durationMillis || 0);
        }
      }, 200);
    } catch (error) {
      setRecordingStatus('error');
      setLastError({ code: 'RECORDING_START_FAILED', message: 'Failed to start recording', details: error instanceof Error ? error.message : 'Unknown error', isRecoverable: true });
      throw error;
    }
  }, [user, checkPermissions, requestPermissions]);

  /** Stop recording, upload audio, and trigger BirdNET analysis */
  const stop = useCallback(async (): Promise<string> => {
    if (!recording) throw new Error('No active recording');
    try {
      setRecordingStatus('processing');
      if (timerRef.current) clearInterval(timerRef.current);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const fileUri = recording.getURI();
      setRecording(null);
      setDuration(0);
      setUri(fileUri || null);
      if (!fileUri) throw new Error('Recording URI not found');
      // Upload audio to Supabase Storage
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists || !fileInfo.size) throw new Error('Audio file not found or empty');
      const fileData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const timestamp = Date.now();
      const storagePath = `${user!.id}/${timestamp}.m4a`;
      const binary = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
      const { error: uploadError } = await supabase.storage.from('audio-clips').upload(storagePath, binary, { contentType: 'audio/mp4', upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      // Create audio_uploads record
      const { data: audioUpload, error: dbError } = await supabase.from('audio_uploads').insert({ user_id: user!.id, path: storagePath, status: 'pending' }).select().single();
      if (dbError || !audioUpload) throw new Error(dbError?.message || 'Failed to create audio_uploads record');
      // Trigger BirdNET analysis
      const { error: fnError } = await supabase.functions.invoke('birdnet-analyze', { body: { audioId: audioUpload.id, storagePath } });
      if (fnError) throw new Error(fnError.message);
      setRecordingStatus('completed');
      return fileUri;
    } catch (error) {
      setRecordingStatus('error');
      setLastError({ code: 'PROCESSING_FAILED', message: 'Failed to process/upload/trigger analysis', details: error instanceof Error ? error.message : 'Unknown error', isRecoverable: true });
      throw error;
    }
  }, [recording, user]);

  useEffect(() => {
    checkPermissions();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [checkPermissions]);

  const reset = useCallback(() => {
    setRecordingStatus('idle');
    setDuration(0);
    setLastError(null);
    setUri(null);
    setRecording(null);
  }, []);

  return {
    isRecording: recordingStatus === 'recording',
    uri,
    start,
    stop,
    reset,
    checkPermissions,
    requestPermissions,
    recordingStatus,
    duration,
    permissionStatus,
    lastError,
  };
}; 