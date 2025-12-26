/**
 * CareNavi Design System
 * Based on Stitch HTML wireframes
 */

// Color Palette
export const colors = {
  // Primary
  primary: '#2bee6c',
  primaryDark: '#1fa84c',
  primaryLight: '#e8fef0',

  // Background & Surface
  background: '#f6f8f6',
  surface: '#ffffff',
  surfaceSecondary: '#f5f5f5',

  // Text
  text: {
    primary: '#1a1a1a',
    secondary: '#6b7280',
    muted: '#9ca3af',
    inverse: '#ffffff',
  },

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // UI Elements
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Special
  glow: 'rgba(43, 238, 108, 0.3)',

  // Status Tags
  tags: {
    insufficient: { bg: '#fef3c7', text: '#d97706' },
    warning: { bg: '#fee2e2', text: '#dc2626' },
    good: { bg: '#dcfce7', text: '#16a34a' },
  },
} as const;

// Border Radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
} as const;

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glowLight: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
} as const;

// Typography
export const typography = {
  // Font Families (fallback to system fonts)
  fontFamily: {
    regular: undefined, // Uses system default
    medium: undefined,
    semiBold: undefined,
    bold: undefined,
  },

  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Icon Sizes
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Button Sizes
export const buttonSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 12,
    fontSize: typography.fontSize.sm,
    iconSize: iconSizes.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: typography.fontSize.md,
    iconSize: iconSizes.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: 20,
    fontSize: typography.fontSize.lg,
    iconSize: iconSizes.lg,
  },
  xl: {
    height: 56,
    paddingHorizontal: 24,
    fontSize: typography.fontSize.xl,
    iconSize: iconSizes.lg,
  },
} as const;

// Card Styles
export const cardStyles = {
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
} as const;

// Animation Durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Export everything as theme object
export const theme = {
  colors,
  borderRadius,
  spacing,
  shadows,
  typography,
  iconSizes,
  buttonSizes,
  cardStyles,
  animations,
} as const;

export default theme;
