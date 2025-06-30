import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilteredBirdsList } from '../components/filters/FilteredBirdsList';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';
import { COLOR_OPTIONS, HABITAT_OPTIONS, SIZE_OPTIONS } from '../constants/FilterOptions';
import { useFilteredBirds } from '../hooks/useFilteredBirds';
import type { BirdSearchFilters, SizeCategory } from '../types/filters';

/**
 * Экран результатов поиска с отображением примененных фильтров
 */
export default function ResultsScreen() {
  const params = useLocalSearchParams();
  
  // Парсинг параметров фильтров из URL
  const filters: BirdSearchFilters = {
    colors: params.colors ? JSON.parse(params.colors as string) : undefined,
    habitat: params.habitat as string || undefined,
    sizeCategory: params.sizeCategory as SizeCategory || undefined,
  };

  const { data: birds = [], isLoading, error } = useFilteredBirds(filters);

  const handleBack = () => {
    router.back();
  };

  const getFilterDisplayName = (type: string, value: string) => {
    switch (type) {
      case 'color':
        return COLOR_OPTIONS.find(option => option.id === value)?.label || value;
      case 'habitat':
        return HABITAT_OPTIONS.find(option => option.id === value)?.label || value;
      case 'size':
        return SIZE_OPTIONS.find(option => option.id === value)?.label || value;
      default:
        return value;
    }
  };

  const renderAppliedFilters = () => {
    const appliedFilters: Array<{
      type: string;
      value: string;
      display: string;
      color?: string;
    }> = [];

    if (filters.colors?.length) {
      filters.colors.forEach(color => {
        const colorOption = COLOR_OPTIONS.find(option => option.id === color);
        appliedFilters.push({
          type: 'color',
          value: color,
          display: colorOption?.label || color,
          color: colorOption?.color,
        });
      });
    }

    if (filters.habitat) {
      appliedFilters.push({
        type: 'habitat',
        value: filters.habitat,
        display: getFilterDisplayName('habitat', filters.habitat),
      });
    }

    if (filters.sizeCategory) {
      appliedFilters.push({
        type: 'size',
        value: filters.sizeCategory,
        display: getFilterDisplayName('size', filters.sizeCategory),
      });
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersBar}>
        {appliedFilters.map((filter, index) => (
          <View key={`${filter.type}-${filter.value}-${index}`} style={styles.filterChip}>
            {filter.type === 'color' && filter.color && (
              <View 
                style={[
                  styles.colorDot, 
                  { backgroundColor: filter.color },
                  filter.color === '#FFFFFF' && styles.whiteColorBorder
                ]} 
              />
            )}
            <Text style={styles.filterChipText}>{filter.display}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
            </Pressable>
            <View style={styles.topBarContent}>
              <Text style={styles.topBarTitle}>Результаты поиска</Text>
              <Text style={styles.topBarSubtitle}>
                Найдено: {birds.length} {birds.length === 1 ? 'птица' : birds.length < 5 ? 'птицы' : 'птиц'}
              </Text>
            </View>
          </View>

          {/* Applied Filters */}
          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>Применённые фильтры:</Text>
            {renderAppliedFilters()}
          </View>

          {/* Results */}
          <View style={styles.resultsSection}>
            <FilteredBirdsList
              birds={birds}
              isLoading={isLoading}
              error={error}
              hasActiveFilters={true}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
    ...DesignTokens.shadows.subtle,
  },
  topBarContent: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  topBarSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  filtersSection: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.sm,
  },
  filtersBar: {
    flexGrow: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.button,
    marginRight: DesignTokens.spacing.sm,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DesignTokens.spacing.xs,
  },
  whiteColorBorder: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
  },
}); 