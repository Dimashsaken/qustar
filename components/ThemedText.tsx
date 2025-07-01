import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'heading' | 'title' | 'subtitle' | 'caption' | 'link' | 'bold';
};

/**
 * Themed text component implementing mobile-first typography system
 * Uses platform-specific fonts with proper hierarchy and contrast ratios
 * @param style - Additional styles to apply
 * @param lightColor - Override light mode color
 * @param darkColor - Override dark mode color
 * @param type - Typography variant to use
 * @param rest - Additional text props
 * @returns JSX.Element - Styled text component
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'bold' ? styles.bold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  heading: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  bold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#4A90E2', // Cerulean - maintains accessibility
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
});
