import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { HABITAT_OPTIONS } from '../../constants/FilterOptions';
import { FilterButton } from './FilterButton';

interface HabitatFilterProps {
  selectedHabitat: string | null;
  onHabitatToggle: (habitatId: string) => void;
}

/**
 * Компонент фильтра по местообитаниям с изображениями в горизонтальной прокрутке
 * @param selectedHabitat - Выбранное местообитание (только одно)
 * @param onHabitatToggle - Обработчик переключения местообитания
 */
export const HabitatFilter: React.FC<HabitatFilterProps> = ({
  selectedHabitat,
  onHabitatToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Местообитание</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {HABITAT_OPTIONS.map((habitat) => (
          <FilterButton
            key={habitat.id}
            id={habitat.id}
            label={habitat.label}
            image={habitat.image}
            isSelected={selectedHabitat === habitat.id}
            onPress={onHabitatToggle}
            variant="habitat"
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