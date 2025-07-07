import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useComments } from '../hooks/useComments';
import { AddCommentForm } from './AddCommentForm';
import { CommentItem } from './CommentItem';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CommentsListProps {
  birdId: string;
  maxHeight?: number;
  showAddForm?: boolean;
}

/**
 * Personal notes list component for displaying user's notes for a bird
 * Includes add note form and handles loading/error states
 * @param birdId - The ID of the bird to show notes for
 * @param maxHeight - Optional maximum height for the notes list
 * @param showAddForm - Whether to show the add note form (default: true)
 * @returns JSX.Element - Personal notes list component
 */
export const CommentsList: React.FC<CommentsListProps> = ({
  birdId,
  maxHeight = 400,
  showAddForm = true,
}) => {
  const { comments, isLoading, error, refetch, count } = useComments(birdId);

  /**
   * Handles refresh action
   */
  const handleRefresh = () => {
    refetch();
  };

  /**
   * Handles note added callback
   */
  const handleCommentAdded = () => {
    refetch();
  };

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText type="default" style={styles.loadingText}>
        Загрузка ваших заметок...
      </ThemedText>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <ThemedText type="title" style={styles.errorText}>
        Ошибка загрузки заметок
      </ThemedText>
      <ThemedText type="default" style={styles.errorSubtext}>
        {error?.message || 'Попробуйте обновить страницу'}
      </ThemedText>
    </View>
  );

  /**
   * Renders empty state when no notes exist
   */
  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <ThemedText type="title" style={styles.emptyTitle}>
        Пока нет заметок
      </ThemedText>
      <ThemedText type="default" style={styles.emptySubtext}>
        Добавьте свои первые наблюдения об этой птице
      </ThemedText>
    </View>
  );

  /**
   * Renders notes header
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.headerTitle}>
        Личные заметки
      </ThemedText>
      {count > 0 && (
        <ThemedText type="default" style={styles.headerCount}>
          {count} {count === 1 ? 'заметка' : 
                   count < 5 ? 'заметки' : 'заметок'}
        </ThemedText>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      
      {/* Add note form */}
      {showAddForm && (
        <AddCommentForm 
          birdId={birdId} 
          onCommentAdded={handleCommentAdded}
        />
      )}
      
      {/* Notes list */}
      <View style={[styles.commentsContainer, { maxHeight }]}>
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : comments.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[Colors.light.primary]}
                tintColor={Colors.light.primary}
              />
            }
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={handleCommentAdded}
                onDelete={handleCommentAdded}
              />
            ))}
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
    paddingBottom: DesignTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerCount: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  commentsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
  },
  loadingText: {
    marginTop: DesignTokens.spacing.sm,
    color: Colors.light.textMuted,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xs,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
    maxWidth: 250,
  },
  bottomSpacing: {
    height: DesignTokens.spacing.lg,
  },
}); 