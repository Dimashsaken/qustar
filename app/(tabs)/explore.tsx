import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StatusBar as RNStatusBar, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [selectedHabitat, setSelectedHabitat] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeCategory | null>(null);

  // Обработчики переключения фильтров
  const handleColorToggle = useCallback((colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  }, []);

  const handleHabitatToggle = useCallback((habitatId: string) => {
    setSelectedHabitat(prev => 
      prev === habitatId ? null : habitatId
    );
  }, []);

  const handleSizeToggle = useCallback((sizeId: string) => {
    const sizeCat = sizeId as SizeCategory;
    setSelectedSize(prev => 
      prev === sizeCat ? null : sizeCat
    );
  }, []);

  // Сброс всех фильтров
  const handleClearFilters = useCallback(() => {
    setSelectedColors([]);
    setSelectedHabitat(null);
    setSelectedSize(null);
  }, []);

  // Проверка наличия активных фильтров
  const hasActiveFilters = selectedColors.length > 0 || 
                          selectedHabitat !== null ||
                          selectedSize !== null;

  // Навигация к результатам поиска
  const handleSearch = useCallback(() => {
    if (!hasActiveFilters) return;

    const params = new URLSearchParams();
    
    if (selectedColors.length > 0) {
      params.set('colors', JSON.stringify(selectedColors));
    }
    if (selectedHabitat) {
      params.set('habitat', selectedHabitat);
    }
    if (selectedSize) {
      params.set('sizeCategory', selectedSize);
    }

    router.push(`/results?${params.toString()}`);
  }, [selectedColors, selectedHabitat, selectedSize, hasActiveFilters]);

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
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
              selectedHabitat={selectedHabitat}
              onHabitatToggle={handleHabitatToggle}
            />
            
            <SizeFilter
              selectedSize={selectedSize}
              onSizeToggle={handleSizeToggle}
            />

            {/* Search section moved to bottom of scroll content */}
            <View style={styles.searchSection}>
              {hasActiveFilters && (
                <View style={styles.filtersSummary}>
                  <Text style={styles.filtersText}>
                    Выбрано фильтров: {selectedColors.length + (selectedHabitat ? 1 : 0) + (selectedSize ? 1 : 0)}
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
            </View>
          </ScrollView>
        </View>
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
});
