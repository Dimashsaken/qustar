import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  surface?: 'background' | 'surface' | 'surfaceAlt';
};

/**
 * Themed view component implementing mobile-first surface system
 * Provides consistent surface colors following the 75% neutral design philosophy
 * @param style - Additional styles to apply
 * @param lightColor - Override light mode color
 * @param darkColor - Override dark mode color
 * @param surface - Surface type: 'background', 'surface', or 'surfaceAlt'
 * @param otherProps - Additional view props
 * @returns JSX.Element - Styled view component
 */
export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  surface = 'background',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    surface
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
