import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import type { BirdListItem } from '../../types/bird';
import { BirdCard } from '../BirdCard';

interface FilteredBirdsListProps {
  birds: BirdListItem[];
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
}

/**
 * Компонент списка отфильтрованных птиц с оптимизированным отображением
 * @param birds - Массив птиц для отображения
 * @param isLoading - Состояние загрузки
 * @param error - Ошибка загрузки
 * @param hasActiveFilters - Есть ли активные фильтры
 */
export const FilteredBirdsList: React.FC<FilteredBirdsListProps> = ({
  birds,
  isLoading,
  error,
  hasActiveFilters,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Поиск птиц...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка загрузки данных</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
      </View>
    );
  }

  if (birds.length === 0 && !hasActiveFilters) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Начните поиск</Text>
        <Text style={styles.emptyText}>
          Выберите критерии фильтрации выше для поиска птиц
        </Text>
      </View>
    );
  }

  if (birds.length === 0 && hasActiveFilters) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Ничего не найдено</Text>
        <Text style={styles.emptyText}>
          Попробуйте изменить критерии поиска
        </Text>
      </View>
    );
  }

  const renderBirdCard = ({ item }: { item: BirdListItem }) => (
    <BirdCard bird={item} variant="grid" showFavoriteButton={false} />
  );

  return (
    <View style={styles.listContainer}>
      <FlashList
        data={birds}
        renderItem={renderBirdCard}
        numColumns={2}
        estimatedItemSize={200}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.xl,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: DesignTokens.spacing.md,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  errorDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingBottom: DesignTokens.spacing.xl,
  },
  separator: {
    height: DesignTokens.spacing.xs,
  },
}); 