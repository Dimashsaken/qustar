/**
 * Audio-related TypeScript types for BirdNET integration
 * Includes types for audio uploads, detections, and recording status
 */

/**
 * Audio upload record from Supabase
 */
export interface AudioUpload {
  id: string;
  user_id: string;
  path: string;
  recorded_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
}

/**
 * Bird detection result from BirdNET analysis
 */
export interface BirdDetection {
  id: string;
  audio_id: string;
  species: string; // Scientific name (existing column)
  confidence: number;
  start_sec: number;
  end_sec: number;
  created_at?: string;
  // Optimized Russian language fields
  display_name?: string; // Russian name when available
  common_name?: string; // English fallback name
}

/**
 * BirdNET API response format (enhanced with Russian language support)
 */
export interface BirdNetPrediction {
  species: string;
  confidence: number;
  start: number;
  end: number;
  // Enhanced response fields from Russian-enabled BirdNET API
  common_name?: string;
  scientific_name?: string;
  display_name?: string;
  russian_name?: string;
  start_time?: number;
  end_time?: number;
}

/**
 * Audio recording status for UI state management
 */
export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

/**
 * Permission status type for better error handling
 */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

/**
 * Enhanced error interface for detailed error reporting
 */
export interface RecordingError {
  code: string;
  message: string;
  details?: string;
  isRecoverable: boolean;
}

/**
 * Audio recorder hook return type
 */
export interface AudioRecorderHook {
  isRecording: boolean;
  recordingStatus: RecordingStatus;
  duration: number;
  uri: string | null;
  permissionStatus?: PermissionStatus;
  lastError?: RecordingError | null;
  start: () => Promise<void>;
  stop: (userId: string) => Promise<string>;
  reset: () => void;
  checkPermissions?: () => Promise<PermissionStatus>;
  requestPermissions?: (showAlerts?: boolean) => Promise<boolean>;
}

/**
 * Detection result with audio metadata
 */
export interface DetectionWithAudio {
  detection: BirdDetection;
  audioUpload: AudioUpload;
} 