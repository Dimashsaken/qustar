import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { HABITAT_OPTIONS } from '../../constants/FilterOptions';
import { FilterButton } from './FilterButton';

interface HabitatFilterProps {
  selectedHabitats: string[];
  onHabitatToggle: (habitatId: string) => void;
}

/**
 * Компонент фильтра по местообитаниям с иконками окружающей среды
 * @param selectedHabitats - Массив выбранных местообитаний
 * @param onHabitatToggle - Обработчик переключения местообитания
 */
export const HabitatFilter: React.FC<HabitatFilterProps> = ({
  selectedHabitats,
  onHabitatToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Местообитание</Text>
      <View style={styles.habitatGrid}>
        {HABITAT_OPTIONS.map((habitat) => (
          <FilterButton
            key={habitat.id}
            id={habitat.id}
            label={habitat.label}
            icon={habitat.icon}
            isSelected={selectedHabitats.includes(habitat.id)}
            onPress={onHabitatToggle}
            variant="default"
          />
        ))}
      </View>
      {selectedHabitats.length > 0 && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>
            Выбрано: {selectedHabitats.join(', ')}
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
  habitatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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