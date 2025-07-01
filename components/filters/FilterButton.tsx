import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { IconSymbol } from '../ui/IconSymbol';

interface FilterButtonProps {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  image?: any;
  isSelected: boolean;
  onPress: (id: string) => void;
  variant?: 'default' | 'color' | 'size' | 'habitat';
  disabled?: boolean;
}

/**
 * Переиспользуемая кнопка фильтра с поддержкой иконок, цветов и различных вариантов
 * @param id - Уникальный идентификатор кнопки
 * @param label - Текст кнопки  
 * @param icon - Имя иконки (опционально)
 * @param color - Цвет для цветовых фильтров (опционально)
 * @param image - Изображение для местообитаний (опционально)
 * @param isSelected - Состояние выбора
 * @param onPress - Обработчик нажатия
 * @param variant - Вариант отображения
 * @param disabled - Отключена ли кнопка
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  id,
  label,
  icon,
  color,
  image,
  isSelected,
  onPress,
  variant = 'default',
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onPress(id);
    }
  };

  const getButtonStyle = () => {
    if (variant === 'color') {
      return [
        styles.button,
        styles.colorButton,
        { backgroundColor: color || Colors.light.surface },
        color === '#FFFFFF' && styles.whiteColorBorder,
        isSelected && styles.colorButtonSelected,
        disabled && styles.buttonDisabled,
      ].filter(Boolean);
    } else if (variant === 'size') {
      return [
        styles.button,
        styles.sizeButton,
        isSelected && styles.sizeButtonSelected,
        disabled && styles.buttonDisabled,
      ].filter(Boolean);
    } else if (variant === 'habitat') {
      return [
        styles.button,
        styles.habitatButton,
        isSelected && styles.habitatButtonSelected,
        disabled && styles.buttonDisabled,
      ].filter(Boolean);
    } else {
      return [
        styles.button,
        isSelected && styles.buttonSelected,
        disabled && styles.buttonDisabled,
      ].filter(Boolean);
    }
  };

  const getTextStyle = () => {
    return [
      styles.buttonText,
      isSelected && variant !== 'color' && variant !== 'habitat' && styles.buttonTextSelected,
      disabled && styles.buttonTextDisabled,
    ].filter(Boolean);
  };

  return (
    <Pressable style={getButtonStyle()} onPress={handlePress}>
      {variant === 'habitat' && image && (
        <Image 
          source={image} 
          style={styles.habitatImage}
          resizeMode="cover"
        />
      )}
      
      {icon && variant !== 'color' && variant !== 'habitat' && (
        <IconSymbol 
          name="circle.fill" 
          size={18} 
          color={isSelected ? '#FFFFFF' : Colors.light.textMuted} 
        />
      )}
      
      {variant !== 'color' && variant !== 'habitat' && (
        <Text style={getTextStyle()} numberOfLines={variant === 'size' ? 2 : 1}>
          {label}
        </Text>
      )}
      
      {isSelected && variant === 'color' && (
        <IconSymbol 
          name="checkmark" 
          size={16} 
          color="#FFFFFF" 
          style={[
            styles.checkmark,
            (color === '#FFFFFF' || color === '#FFD54F' || color === '#FFCA28') && styles.checkmarkDark
          ]}
        />
      )}
      
      {isSelected && variant === 'habitat' && (
        <IconSymbol 
          name="checkmark" 
          size={20} 
          color="#FFFFFF" 
          style={styles.habitatCheckmark}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.button,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: DesignTokens.spacing.xs,
    marginBottom: DesignTokens.spacing.xs,
    minHeight: 40,
  },
  buttonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  colorButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  sizeButton: {
    flex: 1,
    marginRight: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.sm,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginLeft: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: Colors.light.textMuted,
  },
  whiteColorBorder: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  checkmark: {
    position: 'absolute',
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    padding: 4,
  },
  checkmarkDark: {
    backgroundColor: Colors.light.text,
  },
  habitatButton: {
    width: 120,
    height: 90,
    marginRight: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.button,
    padding: 0,
    marginBottom: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitatButtonSelected: {
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  habitatImage: {
    width: '100%',
    height: '100%',
    borderRadius: DesignTokens.borderRadius.button,
  },
  habitatCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 4,
  },
}); 