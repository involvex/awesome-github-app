/**
 * Design Tokens
 *
 * Unified design system constants for spacing, typography, colors,
 * and other visual properties. All values should be referenced from
 * this file to ensure consistency across the app.
 */

// ============ Spacing ============
// Base unit: 8px following the 8pt grid system

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export type Spacing = (typeof spacing)[keyof typeof spacing];

// ============ Border Radius ============

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

export type Radius = (typeof radius)[keyof typeof radius];

// ============ Typography ============

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 28,
  giant: 32,
} as const;

export type FontSize = (typeof fontSize)[keyof typeof fontSize];

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export type LineHeight = (typeof lineHeight)[keyof typeof lineHeight];

export const fontWeight = {
  light: "300" as const,
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
} as const;

export type FontWeight = (typeof fontWeight)[keyof typeof fontWeight];

// ============ Touch Targets ============
// iOS HIG minimum: 44pt (44px on @1x, 88px on @2x, 132px on @3x)
// Android recommends 48dp

export const touchTarget = {
  min: 44,
  sm: 44,
  md: 48,
  lg: 52,
} as const;

export type TouchTarget = (typeof touchTarget)[keyof typeof touchTarget];

// ============ Icon Sizes ============

export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

export type IconSize = (typeof iconSize)[keyof typeof iconSize];

// ============ Animation Durations ============

export const duration = {
  fast: 150,
  base: 200,
  slow: 300,
} as const;

export type Duration = (typeof duration)[keyof typeof duration];

// ============ Z-Index Scale ============

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

export type ZIndex = (typeof zIndex)[keyof typeof zIndex];

// ============ Button Sizes ============
// Maps to touchTarget with additional padding consideration

export const buttonSize = {
  sm: {
    height: touchTarget.sm,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    iconSize: iconSize.sm,
  },
  md: {
    height: touchTarget.md,
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.md,
    iconSize: iconSize.md,
  },
  lg: {
    height: touchTarget.lg,
    paddingHorizontal: spacing.xxl,
    fontSize: fontSize.lg,
    iconSize: iconSize.lg,
  },
} as const;

export type ButtonSize = keyof typeof buttonSize;

// ============ Opacity ============

export const opacity = {
  disabled: 0.5,
  pressed: 0.7,
  hover: 0.9,
  overlay: 0.5,
} as const;

export type Opacity = (typeof opacity)[keyof typeof opacity];
