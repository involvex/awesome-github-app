import {
  TextInput,
  View,
  Pressable,
  Text,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  StyleSheet,
} from "react-native";
import { spacing, radius, iconSize } from "../../lib/design/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import React from "react";

export type InputVariant = "default" | "filled" | "underline";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const sizeConfig = {
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    iconSize: iconSize.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    iconSize: iconSize.md,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: 16,
    iconSize: iconSize.lg,
    minHeight: 52,
  },
} as const;

/**
 * Input
 *
 * An enhanced text input component with variants, sizes, icons,
 * and accessibility support.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   leftIcon="mail-outline"
 *   error={error}
 * />
 * ```
 */
export function Input({
  label,
  error,
  hint,
  variant = "default",
  size = "md",
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  containerStyle,
  required = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...props
}: InputProps) {
  const theme = useAppTheme();
  const config = sizeConfig[size];
  const [isFocused, setIsFocused] = React.useState(false);

  const getVariantStyles = () => {
    const borderColor = error
      ? theme.danger
      : isFocused
        ? theme.primary
        : theme.border;

    switch (variant) {
      case "default":
        return {
          borderWidth: 1,
          borderColor,
          borderRadius: radius.md,
          backgroundColor: theme.surface,
        };
      case "filled":
        return {
          borderWidth: 0,
          borderRadius: radius.md,
          backgroundColor: disabled
            ? theme.surfaceDisabled
            : theme.surfaceHovered,
        };
      case "underline":
        return {
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: "transparent",
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
        };
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              {
                color: error ? theme.danger : theme.text,
              },
              { fontSize: 13 },
            ]}
            numberOfLines={1}
            accessibilityRole="text"
            accessibilityLabel={
              accessibilityLabel ? `${accessibilityLabel} label` : label
            }
          >
            {label}
          </Text>
          {required && (
            <Text style={[styles.required, { color: theme.danger }]}>*</Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            minHeight: config.minHeight,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={config.iconSize}
            color={
              error ? theme.danger : isFocused ? theme.primary : theme.muted
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              fontSize: config.fontSize,
              color: disabled ? theme.muted : theme.text,
              paddingHorizontal: leftIcon ? 0 : config.paddingHorizontal,
              paddingVertical: config.paddingVertical,
            },
            getVariantStyles(),
            rightIcon && { paddingRight: 0 },
            style,
          ]}
          placeholderTextColor={theme.muted}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || hint}
          accessibilityState={{ disabled }}
          {...props}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
            accessibilityRole="button"
            accessibilityLabel={"Clear input"}
            style={({ pressed }) => [
              styles.rightIcon,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name={rightIcon}
              size={config.iconSize}
              color={error ? theme.danger : theme.muted}
            />
          </Pressable>
        )}
      </View>

      {hint && !error && (
        <Text
          style={[styles.hint, { color: theme.subtle }]}
          numberOfLines={2}
        >
          {hint}
        </Text>
      )}

      {error && (
        <Text
          style={[styles.error, { color: theme.danger }]}
          numberOfLines={2}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 2,
  },
  label: {
    fontWeight: "500" as const,
  },
  required: {
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  input: {
    flex: 1,
  },
  leftIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginRight: spacing.md,
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  hint: {
    marginTop: 2,
    fontSize: 12,
  },
  error: {
    marginTop: 2,
    fontSize: 12,
  },
});
