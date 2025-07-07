/**
 * BirdNET Audio Recording Hook
 * Handles audio recording, uploading to Supabase, and triggering BirdNET analysis
 * Uses expo-audio for recording and integrates with the QuStar authentication system
 */

import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AudioRecorderHook, RecordingStatus } from '../types/audio';
import { useAuth } from './useAuth';

/**
 * Hook for recording audio and triggering BirdNET analysis
 * Manages the complete workflow from recording to species identification
 * @returns Audio recorder interface with recording controls and status
 */
export const useBirdnetRecorder = (): AudioRecorderHook => {
  const { user } = useAuth();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);

  /**
   * Start audio recording
   * Requests microphone permissions and begins recording
   */
  const start = useCallback(async () => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to record');
      }

      // Request microphone permissions
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission denied');
      }

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingStatus('recording');
      setDuration(0);

      console.log('🎙️ Started recording audio');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingStatus('error');
      throw error;
    }
  }, [recorder, user]);

  /**
   * Stop recording and trigger BirdNET analysis
   * Uploads audio file to Supabase and calls Edge Function for analysis
   * @param userId - User ID for organizing uploaded files
   * @returns Promise resolving to the audio upload ID
   */
  const stop = useCallback(async (userId: string): Promise<string> => {
    try {
      setRecordingStatus('processing');

      // Stop recording
      await recorder.stop();
      
      if (!recorder.uri) {
        throw new Error('No recording URI available');
      }

      console.log('🎙️ Stopped recording, processing file...');

      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(recorder.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create storage path with user folder structure
      const timestamp = Date.now();
      const storagePath = `${userId}/${timestamp}.m4a`;

      console.log(`📤 Uploading audio to ${storagePath}`);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-clips')
        .upload(storagePath, audioBase64, {
          contentType: 'audio/m4a',
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create audio upload record
      const { data: audioUpload, error: dbError } = await supabase
        .from('audio_uploads')
        .insert({
          user_id: userId,
          path: storagePath,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError || !audioUpload) {
        throw new Error(`Database error: ${dbError?.message}`);
      }

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
        // Don't throw here - the upload succeeded, analysis might still work
      }

      console.log('🔍 BirdNET analysis initiated');
      setRecordingStatus('completed');

      return audioUpload.id;
    } catch (error) {
      console.error('Failed to process recording:', error);
      setRecordingStatus('error');
      throw error;
    }
  }, [recorder]);

  /**
   * Reset recorder to idle state
   */
  const reset = useCallback(() => {
    setRecordingStatus('idle');
    setDuration(0);
  }, []);

  return {
    isRecording: recorder.isRecording,
    recordingStatus,
    duration,
    uri: recorder.uri,
    start,
    stop,
    reset,
  };
}; 