/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Mobile-first UI color palette
 * 75% neutrals (white + greys), 15% sky-blue accents, 7% yellow sparks, 3% green restraint
 * Designed for calm, trustworthy mobile experience with airy interface
 */

// Neutral backbone (≈75% surface)
const neutrals = {
  white: '#FFFFFF',           // Pure White - main canvas, card fills
  mistGrey: '#F5F5F5',       // Mist Grey - alternate sections & list backgrounds
  lightSteel: '#E0E0E0',     // Light Steel - dividers, disabled elements
  graphite: '#444444',       // Graphite - body text, icons
};

// Sky-blue accent (≈15%)
const skyBlue = {
  primary: '#87CEEB',        // Sky Blue - primary accent on headers, focused states
  cerulean: '#4A90E2',       // Cerulean - CTA buttons, links, selection highlights
};

// Yellow spark (≈7%)
const yellow = {
  softSun: '#FFD54F',        // Soft Sun - notification badges, empty-state illustrations
  warmAmber: '#FFCA28',      // Warm Amber - progress bars, success toasts
};

// Green restraint (≤3%)
const green = {
  oliveLime: '#9BB54A',      // Olive-Lime - success icons or environment tags only
};

// Shadow colors
const shadows = {
  cardShadow: '#00000014',   // Card shadow color (2px × 4px × 8px)
  light: '#00000008',        // Light shadow for subtle elevation
};

export const Colors = {
  light: {
    // Primary surfaces
    background: neutrals.white,
    surface: neutrals.white,
    surfaceAlt: neutrals.mistGrey,
    
    // Text hierarchy
    text: neutrals.graphite,
    textSecondary: '#666666',
    textMuted: '#999999',
    
    // Borders and dividers
    border: neutrals.lightSteel,
    divider: neutrals.lightSteel,
    
    // Interactive elements
    primary: skyBlue.cerulean,
    primaryAlt: skyBlue.primary,
    accent: yellow.softSun,
    accentAlt: yellow.warmAmber,
    success: green.oliveLime,
    
    // Navigation and UI
    tint: skyBlue.cerulean,
    icon: neutrals.graphite,
    tabIconDefault: '#999999',
    tabIconSelected: skyBlue.cerulean,
    
    // Shadows
    shadow: shadows.cardShadow,
    shadowLight: shadows.light,
    
    // Status colors
    error: '#DC3545',
    warning: yellow.warmAmber,
    info: skyBlue.primary,
  },
  dark: {
    // Dark mode maintains similar hierarchy with adjusted values
    background: '#151718',
    surface: '#1F2937',
    surfaceAlt: '#374151',
    
    text: '#ECEDEE',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    
    border: '#4B5563',
    divider: '#4B5563',
    
    primary: skyBlue.primary,
    primaryAlt: skyBlue.cerulean,
    accent: yellow.softSun,
    accentAlt: yellow.warmAmber,
    success: green.oliveLime,
    
    tint: skyBlue.primary,
    icon: '#D1D5DB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: skyBlue.primary,
    
    shadow: '#00000040',
    shadowLight: '#00000020',
    
    error: '#EF4444',
    warning: yellow.warmAmber,
    info: skyBlue.primary,
  },
};

// Animation constants for consistent motion design
export const Animations = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: 'ease-out',
};

// Design system constants
export const DesignTokens = {
  borderRadius: {
    card: 12,
    button: 8,
    input: 6,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    heading: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  shadows: {
    card: {
      shadowColor: shadows.cardShadow,
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
    subtle: {
      shadowColor: shadows.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 1,
    },
  },
};
