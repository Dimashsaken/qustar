import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { useDeleteComment, useUpdateComment } from '../hooks/useComments';
import type { BirdComment } from '../types/comment';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CommentItemProps {
  comment: BirdComment;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

/**
 * Individual personal note display component
 * Shows note content, timestamp, and edit/delete options
 * @param comment - Personal note data
 * @param onEdit - Optional callback for edit actions
 * @param onDelete - Optional callback for delete actions
 * @returns JSX.Element - Personal note item component
 */
export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);

  const isLoading = isUpdating || isDeleting;

  /**
   * Formats date to readable format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${diffInHours} ч. назад`;
    } else if (diffInDays < 7) {
      return `${diffInDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  /**
   * Handles save edit
   */
  const handleSaveEdit = () => {
    if (editText.trim() === comment.comment) {
      setIsEditing(false);
      return;
    }

    if (editText.trim().length === 0) {
      Alert.alert('Ошибка', 'Заметка не может быть пустой');
      return;
    }

    updateComment(
      { commentId: comment.id, payload: { comment: editText.trim() } },
      {
        onSuccess: () => {
          setIsEditing(false);
          onEdit?.(comment.id);
        },
        onError: (error) => {
          Alert.alert('Ошибка', error.message);
        },
      }
    );
  };

  /**
   * Handles cancel edit
   */
  const handleCancelEdit = () => {
    setEditText(comment.comment);
    setIsEditing(false);
  };

  /**
   * Handles delete comment
   */
  const handleDelete = () => {
    Alert.alert(
      'Удалить заметку',
      'Вы уверены, что хотите удалить эту заметку?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteComment(
              { commentId: comment.id, birdId: comment.bird_id },
              {
                onSuccess: () => {
                  onDelete?.(comment.id);
                },
                onError: (error) => {
                  Alert.alert('Ошибка', error.message);
                },
              }
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with timestamp and actions */}
      <View style={styles.header}>
        <ThemedText type="default" style={styles.timestamp}>
          {formatDate(comment.created_at)}
          {comment.updated_at !== comment.created_at && (
            <Text style={styles.editedIndicator}> • изменено</Text>
          )}
        </ThemedText>
        
        {!isEditing && (
          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Изменить</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isLoading}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={Colors.light.textMuted} />
              ) : (
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Удалить
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* Comment content */}
      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Введите заметку..."
              placeholderTextColor={Colors.light.textMuted}
              multiline
              maxLength={500}
              autoFocus
            />
            <View style={styles.editActions}>
              <Pressable
                style={[styles.editActionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.editActionButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isUpdating || editText.trim().length === 0}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={Colors.light.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>Сохранить</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <ThemedText type="default" style={styles.commentText}>
            {comment.comment}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    ...DesignTokens.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.textMuted,
    flex: 1,
  },
  editedIndicator: {
    fontStyle: 'italic',
    color: Colors.light.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.xs,
  },
  actionButton: {
    paddingHorizontal: DesignTokens.spacing.xs,
    paddingVertical: 4,
    borderRadius: DesignTokens.borderRadius.input,
    backgroundColor: Colors.light.surfaceAlt,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: Colors.light.surface,
  },
  deleteButtonText: {
    color: Colors.light.text,
  },
  content: {
    minHeight: 20,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.light.text,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: DesignTokens.borderRadius.button,
    padding: DesignTokens.spacing.sm,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    minHeight: 60,
    textAlignVertical: 'top',
    ...Platform.select({
      ios: {
        paddingTop: DesignTokens.spacing.sm,
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.sm,
  },
  editActionButton: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.input,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.surfaceAlt,
  },
  cancelButtonText: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    color: Colors.light.surface,
    fontSize: 14,
    fontWeight: '600',
  },
}); 