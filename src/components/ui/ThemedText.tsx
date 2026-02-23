import { fontSize, fontWeight, lineHeight } from "../../lib/design/tokens";
import { Text, type TextProps } from "react-native";
import { useAppTheme } from "../../lib/theme";

export type ThemedTextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "label"
  | "button";

export type ThemedTextWeight = keyof typeof fontWeight;
export type ThemedTextAlign = "left" | "center" | "right";
export type ThemedTextColor =
  | "primary"
  | "secondary"
  | "accent"
  | "default"
  | "subtle"
  | "muted"
  | "success"
  | "danger"
  | "warning"
  | "info";

export interface ThemedTextProps extends TextProps {
  variant?: ThemedTextVariant;
  weight?: ThemedTextWeight;
  color?: ThemedTextColor;
  align?: ThemedTextAlign;
  className?: string;
  numberOfLines?: number;
}

const variantStyles = {
  display: {
    fontSize: fontSize.giant,
    lineHeight: fontSize.giant * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  h1: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * lineHeight.tight,
    fontWeight: fontWeight.semibold,
  },
  h3: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  },
  h4: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  },
  "body-lg": {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
    fontWeight: fontWeight.normal,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.relaxed,
    fontWeight: fontWeight.normal,
  },
  "body-sm": {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
    fontWeight: fontWeight.normal,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.normal,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: fontWeight.semibold,
  },
  button: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  },
} as const;

const getColor = (
  color: ThemedTextColor,
  theme: ReturnType<typeof useAppTheme>,
) => {
  switch (color) {
    case "primary":
      return theme.text;
    case "secondary":
      return theme.subtle;
    case "accent":
      return theme.primary;
    case "default":
      return theme.text;
    case "subtle":
      return theme.subtle;
    case "muted":
      return theme.muted;
    case "success":
      return theme.success;
    case "danger":
      return theme.danger;
    case "warning":
      return theme.warning;
    case "info":
      return theme.info;
  }
};

/**
 * ThemedText
 *
 * A themed text component with variants, weights, colors, and alignment support.
 *
 * @example
 * ```tsx
 * <ThemedText variant="h1" weight="bold" align="center">
 *   Welcome back
 * </ThemedText>
 * ```
 */
export function ThemedText({
  variant = "body",
  weight,
  color = "default",
  align,
  className = "",
  style,
  ...props
}: ThemedTextProps) {
  const theme = useAppTheme();
  const variantStyle = variantStyles[variant];
  const colorValue = getColor(color, theme);

  return (
    <Text
      className={className}
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: weight ?? variantStyle.fontWeight,
          color: colorValue,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    />
  );
}
