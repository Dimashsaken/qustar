import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, Pressable, StatusBar as RNStatusBar, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilteredBirdsList } from '../components/filters/FilteredBirdsList';
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
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable 
            style={styles.backButton} 
            onPress={handleBack}
            accessible={true}
            accessibilityLabel="Вернуться назад"
            accessibilityRole="button"
          >
            <View style={styles.backButtonBackground}>
              <Ionicons 
                name="chevron-back" 
                size={Platform.OS === 'android' ? 26 : 24} 
                color={Platform.OS === 'android' ? Colors.light.text : Colors.light.text} 
              />
            </View>
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
        <FilteredBirdsList
          birds={birds}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={true}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: Platform.OS === 'android' ? 48 : 40,
    height: Platform.OS === 'android' ? 48 : 40,
    borderRadius: Platform.OS === 'android' ? 24 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  backButtonBackground: {
    width: '100%',
    height: '100%',
    borderRadius: Platform.OS === 'android' ? 24 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        backgroundColor: Colors.light.surface,
        borderWidth: 2,
        borderColor: Colors.light.border,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      ios: {
        backgroundColor: Colors.light.background,
        ...DesignTokens.shadows.subtle,
      },
    }),
  },
  topBarContent: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    ...Platform.select({
      android: { fontFamily: 'sans-serif-medium' },
      ios: { fontFamily: 'SF Pro Display' },
    }),
  },
  topBarSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
    ...Platform.select({
      android: { fontFamily: 'sans-serif' },
      ios: { fontFamily: 'SF Pro Display' },
    }),
  },
  filtersSection: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    maxHeight: 120,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.sm,
    ...Platform.select({
      android: { fontFamily: 'sans-serif-medium' },
      ios: { fontFamily: 'SF Pro Display' },
    }),
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
    ...Platform.select({
      android: { fontFamily: 'sans-serif-medium' },
      ios: { fontFamily: 'SF Pro Display' },
    }),
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
}); 