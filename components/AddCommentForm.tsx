import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { useAddComment } from '../hooks/useComments';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AddCommentFormProps {
  birdId: string;
  onCommentAdded?: () => void;
}

/**
 * Form component for adding new personal notes to birds
 * @param birdId - The ID of the bird to add notes for
 * @param onCommentAdded - Optional callback when note is successfully added
 * @returns JSX.Element - Add personal note form component
 */
export const AddCommentForm: React.FC<AddCommentFormProps> = ({ 
  birdId, 
  onCommentAdded 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { mutate: addComment, isPending } = useAddComment();
  
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const maxLength = 500;
  const remainingChars = maxLength - comment.length;

  /**
   * Handles comment submission
   */
  const handleSubmit = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Вход в систему',
        'Для добавления заметок необходимо войти в систему'
      );
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите заметку');
      return;
    }

    if (comment.trim().length < 3) {
      Alert.alert('Ошибка', 'Заметка должна содержать минимум 3 символа');
      return;
    }

    addComment(
      { bird_id: birdId, comment: comment.trim() },
      {
        onSuccess: () => {
          setComment('');
          setIsExpanded(false);
          Keyboard.dismiss();
          onCommentAdded?.();
        },
        onError: (error) => {
          Alert.alert('Ошибка', error.message);
        },
      }
    );
  };

  /**
   * Handles cancel action
   */
  const handleCancel = () => {
    setComment('');
    setIsExpanded(false);
    Keyboard.dismiss();
  };

  /**
   * Handles input focus with keyboard avoidance
   */
  const handleFocus = () => {
    setIsExpanded(true);
    
    // Enhanced focus handling for better keyboard avoidance
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default" style={styles.loginPrompt}>
          Войдите в систему, чтобы добавить личные заметки
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Comment input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isExpanded && styles.inputExpanded,
            comment.length > 0 && styles.inputWithContent,
          ]}
          value={comment}
          onChangeText={setComment}
          placeholder="Добавьте свои наблюдения и мысли об этой птице..."
          placeholderTextColor={Colors.light.textMuted}
          multiline
          maxLength={maxLength}
          onFocus={handleFocus}
          scrollEnabled={isExpanded}
          textAlignVertical="top"
          blurOnSubmit={false}
          returnKeyType="default"
        />
        
        {/* Character counter */}
        {isExpanded && (
          <Text style={[
            styles.charCounter,
            remainingChars < 50 && styles.charCounterWarning,
            remainingChars < 20 && styles.charCounterDanger,
          ]}>
            {remainingChars} символов осталось
          </Text>
        )}
      </View>

      {/* Action buttons */}
      {isExpanded && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isPending}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.actionButton,
              styles.submitButton,
              (comment.trim().length < 3 || isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={comment.trim().length < 3 || isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={Colors.light.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Сохранить</Text>
            )}
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
        ...DesignTokens.shadows.card,
  },
  loginPrompt: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    paddingVertical: DesignTokens.spacing.lg,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: DesignTokens.borderRadius.button,
    padding: DesignTokens.spacing.sm,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    minHeight: 44,
    maxHeight: 120,
    ...Platform.select({
      ios: {
        paddingTop: DesignTokens.spacing.sm,
      },
      android: {
        fontFamily: 'sans-serif',
        textAlignVertical: 'top',
      },
    }),
  },
  inputExpanded: {
    borderColor: Colors.light.primary,
    minHeight: 100,
    maxHeight: 200,
  },
  inputWithContent: {
    borderColor: Colors.light.primary,
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 12,
    color: Colors.light.textMuted,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charCounterWarning: {
    color: Colors.light.warning,
  },
  charCounterDanger: {
    color: Colors.light.error,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.md,
  },
  actionButton: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.button,
    minWidth: 90,
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
  submitButton: {
    backgroundColor: Colors.light.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  submitButtonText: {
    color: Colors.light.surface,
    fontSize: 14,
    fontWeight: '600',
  },
}); 