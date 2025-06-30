import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors, DesignTokens } from '../../constants/Colors';
import { IconSymbol } from '../ui/IconSymbol';

interface FilterButtonProps {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  isSelected: boolean;
  onPress: (id: string) => void;
  variant?: 'default' | 'color' | 'size';
  disabled?: boolean;
}

/**
 * Переиспользуемая кнопка фильтра с поддержкой иконок, цветов и различных вариантов
 * @param id - Уникальный идентификатор кнопки
 * @param label - Текст кнопки  
 * @param icon - Имя иконки (опционально)
 * @param color - Цвет для цветовых фильтров (опционально)
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
      isSelected && variant !== 'color' && styles.buttonTextSelected,
      disabled && styles.buttonTextDisabled,
    ].filter(Boolean);
  };

  return (
    <Pressable style={getButtonStyle()} onPress={handlePress}>
      {icon && variant !== 'color' && (
        <IconSymbol 
          name="circle.fill" 
          size={18} 
          color={isSelected ? '#FFFFFF' : Colors.light.textMuted} 
        />
      )}
      
      {variant !== 'color' && (
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
}); 