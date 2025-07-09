/**
 * Feedback type options for categorizing user feedback
 */
export type FeedbackType = 'general' | 'bug_report' | 'feature_request' | 'improvement' | 'other';

/**
 * Feedback status options for tracking feedback lifecycle
 */
export type FeedbackStatus = 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';

/**
 * Device information interface for feedback context
 */
export interface DeviceInfo {
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  screenSize?: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

/**
 * Complete feedback record from database
 */
export interface Feedback {
  id: string;
  user_id?: string;
  feedback_type: FeedbackType;
  subject: string;
  message: string;
  rating?: number;
  status: FeedbackStatus;
  user_email?: string;
  device_info?: DeviceInfo;
  app_version?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Feedback data for creating new feedback (without rating)
 */
export interface CreateFeedbackData {
  feedback_type: FeedbackType;
  subject: string;
  message: string;
  user_email?: string;
  device_info?: DeviceInfo;
  app_version?: string;
}

/**
 * Feedback submission response
 */
export interface FeedbackSubmissionResult {
  success: boolean;
  feedback?: Feedback;
  error?: string;
} 