import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { SIZE_OPTIONS } from '../../constants/FilterOptions';
import type { SizeCategory } from '../../types/filters';

interface SizeFilterProps {
  selectedSize: SizeCategory | null;
  onSizeToggle: (sizeId: string) => void;
}

// Mapping of size categories to silhouette images
const SIZE_SILHOUETTES = {
  'very-small': require('../../assets/images/20250630_1433_Силуэт скворца_simple_compose_01jyzrkj44ed991fcm288gkwf5.png'),
  'small-medium': require('../../assets/images/20250630_1433_Силуэт вороны_simple_compose_01jyzrm5p2ejvar1g4raa9brpw.png'),
  'large': require('../../assets/images/20250630_1434_Силуэт гуся_simple_compose_01jyzrpehweg5rft3asfm8grm2.png'),
  'very-large': require('../../assets/images/ChatGPT Image Jun 30, 2025, 06_53_16 PM.png'),
};

/**
 * Компонент фильтра по размерам с силуэтами птиц
 * @param selectedSize - Выбранная размерная категория (только одна)
 * @param onSizeToggle - Обработчик переключения размера
 */
export const SizeFilter: React.FC<SizeFilterProps> = ({
  selectedSize,
  onSizeToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Размер птицы</Text>
      <Text style={styles.subtitle}>
        Выберите размер, похожий на этот
      </Text>
      
      <View style={styles.sizeGrid}>
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSize === size.id;
          return (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeButton,
                isSelected && styles.selectedButton
              ]}
              onPress={() => onSizeToggle(size.id)}
              activeOpacity={0.7}
            >
              <Image
                source={SIZE_SILHOUETTES[size.id as keyof typeof SIZE_SILHOUETTES]}
                style={[
                  styles.silhouetteImage,
                  isSelected && styles.selectedImage
                ]}
                resizeMode="contain"
              />
              <Text style={[
                styles.sizeLabel,
                isSelected && styles.selectedLabel
              ]}>
                {size.label}
              </Text>
              <Text style={[
                styles.sizeRange,
                isSelected && styles.selectedRange
              ]}>
                {size.range}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: DesignTokens.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: DesignTokens.spacing.md,
    lineHeight: 20,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: DesignTokens.spacing.sm,
  },
  sizeButton: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: DesignTokens.borderRadius.button,
    padding: DesignTokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    minHeight: 160,
  },
  selectedButton: {
    backgroundColor: Colors.light.primaryAlt,
    borderColor: Colors.light.primary,
  },
  silhouetteImage: {
    width: 64,
    height: 64,
    tintColor: '#000000', // Make images appear as dark silhouettes
    marginBottom: DesignTokens.spacing.md,
  },
  selectedImage: {
    opacity: 0.8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 8,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedLabel: {
    color: Colors.light.primary,
  },
  sizeRange: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  selectedRange: {
    color: Colors.light.primary,
  },
}); 