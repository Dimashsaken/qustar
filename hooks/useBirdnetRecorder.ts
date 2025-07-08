/**
 * BirdNET Audio Recording Hook
 * Handles audio recording, uploading to Supabase, and triggering BirdNET analysis
 * Uses expo-audio for recording and integrates with the QuStar authentication system
 */

import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import type { AudioRecorderHook, PermissionStatus, RecordingError, RecordingStatus } from '../types/audio';
import { useAuth } from './useAuth';

// Custom recording settings optimized for bird sounds
const BIRD_RECORDING_PRESET = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    sampleRate: 48000, // BirdNET requirement
    numberOfChannels: 1, // Mono for smaller files
    bitRate: 128000,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    sampleRate: 48000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
};



/**
 * Hook for recording audio and triggering BirdNET analysis
 * Manages the complete workflow from recording to species identification
 * @returns Audio recorder interface with recording controls and status
 */
export const useBirdnetRecorder = (): AudioRecorderHook => {
  const { user } = useAuth();
  const recorder = useAudioRecorder(BIRD_RECORDING_PRESET);
  const recorderState = useAudioRecorderState(recorder);
  
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [lastError, setLastError] = useState<RecordingError | null>(null);

  /**
   * Check current microphone permission status
   */
  const checkPermissions = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status } = await AudioModule.getRecordingPermissionsAsync();
      const permStatus = status as PermissionStatus;
      setPermissionStatus(permStatus);
      return permStatus;
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('undetermined');
      return 'undetermined';
    }
  }, []);

  /**
   * Request microphone permissions with user-friendly guidance
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const currentStatus = await checkPermissions();
      
      if (currentStatus === 'granted') {
        return true;
      }

      if (currentStatus === 'blocked') {
        Alert.alert(
          'Microphone Access Required',
          'To record bird sounds, please enable microphone access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
                       { text: 'Open Settings', onPress: () => {
             // Note: Opening settings requires additional setup
             console.log('Open settings requested');
           }},
          ]
        );
        return false;
      }

      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record bird sounds for identification. Please grant permission and try again.',
          [{ text: 'OK' }]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setLastError({
        code: 'PERMISSION_ERROR',
        message: 'Failed to request microphone permissions',
        details: error instanceof Error ? error.message : 'Unknown error',
        isRecoverable: true,
      });
      return false;
    }
  }, [checkPermissions]);

  /**
   * Validate recorded audio file before upload
   */
  const validateAudioFile = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        setLastError({
          code: 'FILE_NOT_FOUND',
          message: 'Recording file not found',
          isRecoverable: false,
        });
        return false;
      }

      // Check minimum file size (1KB = roughly 0.1 seconds of audio)
      if (fileInfo.size < 1024) {
        setLastError({
          code: 'FILE_TOO_SMALL',
          message: 'Recording is too short or empty',
          details: `File size: ${fileInfo.size} bytes`,
          isRecoverable: false,
        });
        return false;
      }

      // Check maximum file size (50MB to prevent huge uploads)
      if (fileInfo.size > 50 * 1024 * 1024) {
        setLastError({
          code: 'FILE_TOO_LARGE',
          message: 'Recording is too large',
          details: `File size: ${Math.round(fileInfo.size / 1024 / 1024)}MB`,
          isRecoverable: false,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating audio file:', error);
      setLastError({
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate recording',
        details: error instanceof Error ? error.message : 'Unknown error',
        isRecoverable: false,
      });
      return false;
    }
  }, []);

  // Monitor permission status on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Monitor recording state
  useEffect(() => {
    if (recorderState.isRecording) {
      // Duration will be tracked via manual timer if needed
      // or from the recorder state when available
    }
  }, [recorderState.isRecording]);

  /**
   * Start audio recording with enhanced error handling
   */
  const start = useCallback(async () => {
    try {
      setLastError(null);
      
      if (!user) {
        throw new Error('User must be authenticated to record');
      }

      // Check and request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingStatus('recording');
      setDuration(0);

      console.log('🎙️ Started recording audio with optimized settings');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingStatus('error');
      setLastError({
        code: 'RECORDING_START_FAILED',
        message: 'Failed to start recording',
        details: error instanceof Error ? error.message : 'Unknown error',
        isRecoverable: true,
      });
      throw error;
    }
  }, [recorder, user, requestPermissions]);

  /**
   * Stop recording and trigger BirdNET analysis with retry mechanism
   */
  const stop = useCallback(async (userId: string): Promise<string> => {
    let audioUploadId: string | null = null;
    
    try {
      setRecordingStatus('processing');
      setLastError(null);

      // Stop recording
      await recorder.stop();
      
      if (!recorder.uri) {
        throw new Error('No recording URI available');
      }

      console.log('🎙️ Stopped recording, validating file...');

      // Validate audio file
      const isValid = await validateAudioFile(recorder.uri);
      if (!isValid) {
        throw new Error(lastError?.message || 'Audio validation failed');
      }

      // Read audio file as binary data
      const audioData = await FileSystem.readAsStringAsync(recorder.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!audioData || audioData.length === 0) {
        throw new Error('Audio file is empty or could not be read');
      }

      console.log(`📁 Audio file size: ${Math.round(audioData.length * 0.75 / 1024)}KB`);

      // Create storage path with user folder structure
      const timestamp = Date.now();
      const storagePath = `${userId}/${timestamp}.m4a`;

      console.log(`📤 Uploading audio to ${storagePath}`);

      // Convert base64 to binary for upload
      const binaryData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));

      // Upload to Supabase Storage with retry logic
      let uploadSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!uploadSuccess && retryCount < maxRetries) {
        try {
          const { error: uploadError } = await supabase.storage
            .from('audio-clips')
            .upload(storagePath, binaryData, {
              contentType: 'audio/mp4',
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(uploadError instanceof Error ? uploadError.message : 'Upload failed');
          }
          
          uploadSuccess = true;
          console.log('✅ Audio uploaded successfully');
        } catch (uploadError) {
          retryCount++;
          console.error(`Upload attempt ${retryCount} failed:`, uploadError);
          
          if (retryCount >= maxRetries) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
            throw new Error(`Upload failed after ${maxRetries} attempts: ${errorMessage}`);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      // Verify the uploaded file
      const { data: fileData, error: verifyError } = await supabase.storage
        .from('audio-clips')
        .download(storagePath);

      if (verifyError || !fileData) {
        console.error('File verification failed:', verifyError);
        throw new Error('Uploaded file could not be verified');
      }

      console.log(`✅ File verified: ${fileData.size} bytes`);

      // Create audio upload record
      const { data: audioUpload, error: dbError } = await supabase
        .from('audio_uploads')
        .insert({
          user_id: userId,
          path: storagePath,
          status: 'pending',
          file_size: fileData.size,
        })
        .select()
        .single();

      if (dbError || !audioUpload) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError?.message}`);
      }

      audioUploadId = audioUpload.id;
      console.log(`📝 Created audio record ${audioUpload.id}`);

      // Trigger BirdNET analysis via Edge Function
      const { error: functionError } = await supabase.functions.invoke('birdnet-analyze', {
        body: {
          audioId: audioUpload.id,
          storagePath,
        },
      });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        // Update status to failed but don't throw - the upload succeeded
        await supabase
          .from('audio_uploads')
          .update({ 
            status: 'failed',
            error_message: functionError.message,
          })
          .eq('id', audioUpload.id);
      }

      console.log('🔍 BirdNET analysis initiated');
      setRecordingStatus('completed');

      return audioUpload.id;
    } catch (error) {
      console.error('Failed to process recording:', error);
      setRecordingStatus('error');
      
      const errorDetails = error instanceof Error ? error.message : 'Unknown error';
      setLastError({
        code: 'PROCESSING_FAILED',
        message: 'Failed to process recording',
        details: errorDetails,
        isRecoverable: true,
      });

      // If we created an audio record but processing failed, mark it as failed
      if (audioUploadId) {
        await supabase
          .from('audio_uploads')
          .update({ 
            status: 'failed',
            error_message: errorDetails,
          })
          .eq('id', audioUploadId);
      }

      throw error;
    }
  }, [recorder, validateAudioFile, lastError]);

  /**
   * Reset recorder to idle state
   */
  const reset = useCallback(() => {
    setRecordingStatus('idle');
    setDuration(0);
    setLastError(null);
  }, []);

  return {
    isRecording: recorder.isRecording,
    recordingStatus,
    duration,
    uri: recorder.uri,
    permissionStatus,
    lastError,
    start,
    stop,
    reset,
    checkPermissions,
    requestPermissions,
  };
}; 