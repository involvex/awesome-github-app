import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
  type AccessibilityState,
} from "react-native";
import { buttonSize, radius } from "../../lib/design/tokens";
import type { PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<
  PressableProps,
  "children" | "style"
> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: PressableProps["style"];
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const getVariantStyles = (
  variant: ButtonVariant,
  theme: ReturnType<typeof useAppTheme>,
  disabled: boolean,
) => {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: disabled ? theme.surfaceDisabled : theme.buttonPrimary,
        borderColor: "transparent",
        textColor: theme.buttonPrimaryText,
      };
    case "secondary":
      return {
        backgroundColor: disabled
          ? theme.surfaceDisabled
          : theme.buttonSecondary,
        borderColor: theme.buttonSecondaryBorder,
        textColor: theme.buttonSecondaryText,
      };
    case "outline":
      return {
        backgroundColor: theme.buttonOutline,
        borderColor: theme.buttonOutlineBorder,
        textColor: disabled ? theme.muted : theme.buttonOutlineText,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: disabled ? theme.muted : theme.buttonGhostText,
      };
    case "danger":
      return {
        backgroundColor: disabled ? theme.surfaceDisabled : theme.buttonDanger,
        borderColor: "transparent",
        textColor: theme.buttonDangerText,
      };
  }
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: ButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, theme, isDisabled);
  const sizeConfig = buttonSize[size];

  const accessibilityState: AccessibilityState = {
    disabled: isDisabled,
    busy: loading,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      style={({ pressed }) => {
        const userStyle =
          typeof style === "function" ? style({ pressed }) : style;

        return [
          styles.button,
          {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            opacity: pressed && !isDisabled ? 0.8 : 1,
          },
          fullWidth && styles.fullWidth,
          userStyle,
        ];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={variantStyles.textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeConfig.fontSize,
              },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={variantStyles.textColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: -4,
  },
  iconRight: {
    marginLeft: -4,
  },
  loader: {
    marginHorizontal: 4,
  },
});
