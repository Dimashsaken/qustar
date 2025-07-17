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
 * Компонент фильтра по цветам с цветными кругами в горизонтальной прокрутке
 * @param selectedColors - Массив выбранных цветов
 * @param onColorToggle - Обработчик переключения цвета
 */
export const ColorFilter: React.FC<ColorFilterProps> = ({
  selectedColors,
  onColorToggle,
}) => {
  // Split colors into two rows
  const firstRow = COLOR_OPTIONS.slice(0, Math.ceil(COLOR_OPTIONS.length / 2));
  const secondRow = COLOR_OPTIONS.slice(Math.ceil(COLOR_OPTIONS.length / 2));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Окрас</Text>
      <View style={styles.rowsContainer}>
        <View style={styles.row}>
          {firstRow.map((color) => (
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
        <View style={styles.row}>
          {secondRow.map((color) => (
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
      </View>
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
  rowsContainer: {
    gap: DesignTokens.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.sm,
    justifyContent: 'flex-start',
  },
}); 