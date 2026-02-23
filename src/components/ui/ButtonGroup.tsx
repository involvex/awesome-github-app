import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "../../lib/design/tokens";

export interface ButtonGroupProps {
  buttons: ButtonProps[];
  size?: ButtonSize;
  variant?: ButtonVariant;
  spacing?: number;
  vertical?: boolean;
  fullWidth?: boolean;
}

/**
 * ButtonGroup
 *
 * Groups multiple buttons together with consistent spacing.
 * Can be arranged horizontally or vertically.
 *
 * @example
 * ```tsx
 * <ButtonGroup
 *   buttons={[
 *     { title: "Cancel", variant: "outline", onPress: () => {} },
 *     { title: "Confirm", variant: "primary", onPress: () => {} },
 *   ]}
 * />
 * ```
 */
export function ButtonGroup({
  buttons,
  size = "md",
  variant = "primary",
  spacing: spacingValue = spacing.md,
  vertical = false,
  fullWidth = false,
}: ButtonGroupProps) {
  return (
    <View
      style={[
        styles.container,
        vertical ? styles.vertical : styles.horizontal,
        fullWidth && styles.fullWidth,
      ]}
    >
      {buttons.map((buttonProps, index) => {
        const spacingStyle =
          vertical && index > 0
            ? { marginTop: spacingValue }
            : !vertical && index > 0
              ? { marginLeft: spacingValue }
              : undefined;

        const userStyle = buttonProps.style;
        const mergedStyle: ButtonProps["style"] =
          typeof userStyle === "function"
            ? state => {
                const resolved = userStyle(state);
                const combined = Array.isArray(resolved)
                  ? [spacingStyle, ...resolved]
                  : [spacingStyle, resolved];

                return combined.filter(Boolean) as StyleProp<ViewStyle>;
              }
            : ([spacingStyle, userStyle].filter(
                Boolean,
              ) as StyleProp<ViewStyle>);

        return (
          <Button
            key={index}
            {...buttonProps}
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            style={mergedStyle}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
  fullWidth: {
    width: "100%",
  },
});
