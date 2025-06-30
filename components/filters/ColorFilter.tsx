import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { COLOR_OPTIONS } from '../../constants/FilterOptions';
import { FilterButton } from './FilterButton';

interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (colorId: string) => void;
}

/**
 * Компонент фильтра по цветам с цветными кругами
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
      <View style={styles.colorGrid}>
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
      </View>
      {selectedColors.length > 0 && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>
            Выбрано: {selectedColors.length} {selectedColors.length === 1 ? 'цвет' : 'цвета'}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: DesignTokens.spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectedInfo: {
    marginTop: DesignTokens.spacing.sm,
    paddingTop: DesignTokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  selectedText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
}); 