import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import type { BirdComment } from '../types/comment';
import { BirdImage } from './BirdImage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface UserNoteCardProps {
  note: BirdComment;
  birdInfo?: {
    id: string;
    common_name_ru?: string;
    common_name_en?: string;
    scientific_name?: string;
  };
}

/**
 * Card component for displaying user's note with bird information in profile
 * Allows navigation to the bird detail page
 * @param note - User's note data
 * @param birdInfo - Bird information associated with the note
 * @returns JSX.Element - User note card component
 */
export const UserNoteCard: React.FC<UserNoteCardProps> = ({ 
  note, 
  birdInfo 
}) => {
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
   * Gets display name for the bird
   */
  const getBirdDisplayName = (): string => {
    if (birdInfo) {
      return birdInfo.common_name_ru || 
             birdInfo.common_name_en || 
             birdInfo.scientific_name || 
             'Неизвестная птица';
    }
    return 'Птица';
  };

  /**
   * Handles navigation to bird detail page
   */
  const handlePress = () => {
    router.push(`/bird/${note.bird_id}` as any);
  };

  /**
   * Truncates note text for preview
   */
  const getTruncatedNote = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <ThemedView style={styles.container}>
        {/* Bird image and info */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <BirdImage 
              birdId={note.bird_id}
              scientificName={birdInfo?.scientific_name}
              size={60}
              style={styles.birdImage}
            />
          </View>
          
          <View style={styles.birdInfo}>
            <ThemedText type="bold" style={styles.birdName}>
              {getBirdDisplayName()}
            </ThemedText>
            {birdInfo?.scientific_name && (
              <ThemedText type="default" style={styles.scientificName}>
                {birdInfo.scientific_name}
              </ThemedText>
            )}
            <ThemedText type="default" style={styles.timestamp}>
              {formatDate(note.created_at)}
              {note.updated_at !== note.created_at && (
                <Text style={styles.editedIndicator}> • изменено</Text>
              )}
            </ThemedText>
          </View>
        </View>

        {/* Note content */}
        <View style={styles.noteContent}>
          <ThemedText type="default" style={styles.noteText}>
            {getTruncatedNote(note.comment)}
          </ThemedText>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    marginBottom: DesignTokens.spacing.sm,
  },
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.md,
    ...DesignTokens.shadows.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing.sm,
  },
  imageContainer: {
    marginRight: DesignTokens.spacing.md,
  },
  birdImage: {
    width: 60,
    height: 60,
    borderRadius: DesignTokens.borderRadius.button,
  },
  birdInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  birdName: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  editedIndicator: {
    fontStyle: 'italic',
    color: Colors.light.textMuted,
  },
  noteContent: {
    marginBottom: DesignTokens.spacing.xs,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  arrowContainer: {
    position: 'absolute',
    right: DesignTokens.spacing.md,
    top: '50%',
    marginTop: -10,
  },
  arrow: {
    fontSize: 20,
    color: Colors.light.textMuted,
    fontWeight: '300',
  },
}); 