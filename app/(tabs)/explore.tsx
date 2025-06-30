import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ColorFilter } from '../../components/filters/ColorFilter';
import { HabitatFilter } from '../../components/filters/HabitatFilter';
import { SizeFilter } from '../../components/filters/SizeFilter';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../../constants/Colors';
import type { SizeCategory } from '../../types/filters';

/**
 * Главный экран исследования птиц с комплексной системой фильтрации
 * Позволяет искать птиц по цвету, местообитанием и размеру с местными эталонами
 */
export default function ExploreScreen() {
  // Состояние фильтров
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedHabitats, setSelectedHabitats] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeCategory[]>([]);

  // Обработчики переключения фильтров
  const handleColorToggle = useCallback((colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  }, []);

  const handleHabitatToggle = useCallback((habitatId: string) => {
    setSelectedHabitats(prev => 
      prev.includes(habitatId) 
        ? prev.filter(id => id !== habitatId)
        : [...prev, habitatId]
    );
  }, []);

  const handleSizeToggle = useCallback((sizeId: string) => {
    const sizeCat = sizeId as SizeCategory;
    setSelectedSizes(prev => 
      prev.includes(sizeCat) 
        ? prev.filter(id => id !== sizeCat)
        : [...prev, sizeCat]
    );
  }, []);

  // Сброс всех фильтров
  const handleClearFilters = useCallback(() => {
    setSelectedColors([]);
    setSelectedHabitats([]);
    setSelectedSizes([]);
  }, []);

  // Проверка наличия активных фильтров
  const hasActiveFilters = selectedColors.length > 0 || 
                          selectedHabitats.length > 0 || 
                          selectedSizes.length > 0;

  // Навигация к результатам поиска
  const handleSearch = useCallback(() => {
    if (!hasActiveFilters) return;

    const params = new URLSearchParams();
    
    if (selectedColors.length > 0) {
      params.set('colors', JSON.stringify(selectedColors));
    }
    if (selectedHabitats.length > 0) {
      params.set('habitat', JSON.stringify(selectedHabitats));
    }
    if (selectedSizes.length > 0) {
      params.set('sizeCategory', JSON.stringify(selectedSizes));
    }

    router.push(`/results?${params.toString()}`);
  }, [selectedColors, selectedHabitats, selectedSizes, hasActiveFilters]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Поиск птиц</Text>
          <Text style={styles.subtitle}>
            Определите птицу по её характеристикам
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ColorFilter
            selectedColors={selectedColors}
            onColorToggle={handleColorToggle}
          />
          
          <HabitatFilter
            selectedHabitats={selectedHabitats}
            onHabitatToggle={handleHabitatToggle}
          />
          
          <SizeFilter
            selectedSizes={selectedSizes}
            onSizeToggle={handleSizeToggle}
          />

          {/* Search section moved to bottom of scroll content */}
          <View style={styles.searchSection}>
            {hasActiveFilters && (
              <View style={styles.filtersSummary}>
                <Text style={styles.filtersText}>
                  Выбрано фильтров: {[...selectedColors, ...selectedHabitats, ...selectedSizes].length}
                </Text>
                <Pressable onPress={handleClearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Сбросить</Text>
                </Pressable>
              </View>
            )}
            
            <Pressable 
              style={[
                styles.searchButton, 
                !hasActiveFilters && styles.searchButtonDisabled
              ]}
              onPress={handleSearch}
              disabled={!hasActiveFilters}
            >
              <IconSymbol 
                name="magnifyingglass" 
                size={24} 
                color={hasActiveFilters ? '#FFFFFF' : Colors.light.textMuted} 
              />
              <Text style={[
                styles.searchButtonText,
                !hasActiveFilters && styles.searchButtonTextDisabled
              ]}>
                {hasActiveFilters ? 'Найти птиц' : 'Выберите фильтры для поиска'}
              </Text>
            </Pressable>
            
            <Text style={styles.searchHint}>
              Выберите характеристики птицы, которую хотите найти
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignTokens.spacing.lg,
  },
  searchSection: {
    marginTop: DesignTokens.spacing.xl,
    paddingTop: DesignTokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  filtersSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.card,
    marginBottom: DesignTokens.spacing.lg,
    width: '100%',
    ...DesignTokens.shadows.subtle,
  },
  filtersText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    backgroundColor: Colors.light.error,
    borderRadius: DesignTokens.borderRadius.button,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.card,
    marginBottom: DesignTokens.spacing.lg,
    width: '100%',
    ...DesignTokens.shadows.card,
  },
  searchButtonDisabled: {
    backgroundColor: Colors.light.surfaceAlt,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: DesignTokens.spacing.sm,
  },
  searchButtonTextDisabled: {
    color: Colors.light.textMuted,
  },
  searchHint: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
