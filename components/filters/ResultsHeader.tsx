import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { IconSymbol } from '../ui/IconSymbol';

interface ResultsHeaderProps {
  resultsCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isLoading?: boolean;
}

/**
 * Компонент заголовка результатов фильтрации с кнопкой сброса
 * @param resultsCount - Количество найденных птиц
 * @param hasActiveFilters - Есть ли активные фильтры
 * @param onClearFilters - Обработчик сброса всех фильтров
 * @param isLoading - Состояние загрузки
 */
export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  resultsCount,
  hasActiveFilters,
  onClearFilters,
  isLoading = false,
}) => {
  const getResultText = () => {
    if (isLoading) return 'Поиск...';
    
    if (resultsCount === 0) {
      return hasActiveFilters ? 'Птицы не найдены' : 'Выберите фильтры для поиска';
    }
    
    const birdWord = resultsCount === 1 ? 'птица' : 
                     resultsCount < 5 ? 'птицы' : 'птиц';
    
    return `${resultsCount} ${birdWord}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsCount}>{getResultText()}</Text>
          {hasActiveFilters && !isLoading && (
            <Text style={styles.activeFiltersHint}>
              Применены фильтры
            </Text>
          )}
        </View>
        
        {hasActiveFilters && (
          <Pressable style={styles.clearButton} onPress={onClearFilters}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Colors.light.textMuted} />
            <Text style={styles.clearButtonText}>Сбросить</Text>
          </Pressable>
        )}
      </View>
      
      {resultsCount === 0 && hasActiveFilters && !isLoading && (
        <View style={styles.noResultsHint}>
          <Text style={styles.hintText}>
            Попробуйте изменить критерии поиска или сбросить фильтры
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.md,
    ...DesignTokens.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  activeFiltersHint: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.background,
    borderRadius: DesignTokens.borderRadius.button,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginLeft: DesignTokens.spacing.xs,
  },
  noResultsHint: {
    marginTop: DesignTokens.spacing.md,
    paddingTop: DesignTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  hintText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 