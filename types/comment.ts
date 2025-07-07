/**
 * TypeScript types for the bird comments system
 */

/**
 * Bird comment database record
 */
export interface BirdComment {
  id: string;
  user_id: string;
  bird_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

/**
 * Comment with user information for display
 */
export interface CommentWithUser {
  id: string;
  user_id: string;
  bird_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

/**
 * Comment with bird information for profile display
 */
export interface CommentWithBird extends BirdComment {
  bird?: {
    id: string;
    common_name_ru?: string;
    common_name_en?: string;
    scientific_name?: string;
  };
}

/**
 * Comment creation payload
 */
export interface CreateCommentPayload {
  bird_id: string;
  comment: string;
}

/**
 * Comment update payload
 */
export interface UpdateCommentPayload {
  comment: string;
}

/**
 * Comment error type
 */
export interface CommentError {
  message: string;
  code?: string;
}

/**
 * Comment response type
 */
export interface CommentResponse {
  comment: BirdComment | null;
  error: CommentError | null;
}

/**
 * Comments list response type
 */
export interface CommentsResponse {
  comments: CommentWithUser[];
  error: CommentError | null;
  count: number;
} 