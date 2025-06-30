import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { COLOR_OPTIONS } from '../../constants/FilterOptions';
import { FilterButton } from './FilterButton';

interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (colorId: string) => void;
}

/**
 * Компонент фильтра по цветам с цветными кругами в горизонтальной прокрутке
 * @param selectedColors - Массив выбранных цветов
 * @param onColorToggle - Обработчик переключения цвета
 */
export const ColorFilter: React.FC<ColorFilterProps> = ({
  selectedColors,
  onColorToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Цвет оперения</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {COLOR_OPTIONS.map((color) => (
          <FilterButton
            key={color.id}
            id={color.id}
            label={color.label}
            color={color.color}
            isSelected={selectedColors.includes(color.id)}
            onPress={onColorToggle}
            variant="color"
          />
        ))}
      </ScrollView>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.md,
  },
  scrollView: {
    marginHorizontal: -DesignTokens.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.xs,
  },
}); 