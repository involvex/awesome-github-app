import {
  View,
  Pressable,
  Text,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { spacing, radius, iconSize } from "../../lib/design/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  variant: AlertVariant;
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const variantConfig = {
  info: {
    icon: "information-circle" as const,
    getIconColor: (theme: ReturnType<typeof useAppTheme>) => theme.info,
    getBackgroundColor: () => "rgba(9, 105, 218, 0.1)",
    getBorderColor: (theme: ReturnType<typeof useAppTheme>) => theme.info,
    getTitleColor: (theme: ReturnType<typeof useAppTheme>) => theme.text,
    getMessageColor: (theme: ReturnType<typeof useAppTheme>) => theme.subtle,
  },
  success: {
    icon: "checkmark-circle" as const,
    getIconColor: (theme: ReturnType<typeof useAppTheme>) => theme.success,
    getBackgroundColor: () => "rgba(26, 127, 55, 0.1)",
    getBorderColor: (theme: ReturnType<typeof useAppTheme>) => theme.success,
    getTitleColor: (theme: ReturnType<typeof useAppTheme>) => theme.text,
    getMessageColor: (theme: ReturnType<typeof useAppTheme>) => theme.subtle,
  },
  warning: {
    icon: "warning" as const,
    getIconColor: (theme: ReturnType<typeof useAppTheme>) => theme.warning,
    getBackgroundColor: () => "rgba(154, 103, 0, 0.1)",
    getBorderColor: (theme: ReturnType<typeof useAppTheme>) => theme.warning,
    getTitleColor: (theme: ReturnType<typeof useAppTheme>) => theme.text,
    getMessageColor: (theme: ReturnType<typeof useAppTheme>) => theme.subtle,
  },
  error: {
    icon: "close-circle" as const,
    getIconColor: (theme: ReturnType<typeof useAppTheme>) => theme.danger,
    getBackgroundColor: () => "rgba(207, 34, 46, 0.1)",
    getBorderColor: (theme: ReturnType<typeof useAppTheme>) => theme.danger,
    getTitleColor: (theme: ReturnType<typeof useAppTheme>) => theme.text,
    getMessageColor: (theme: ReturnType<typeof useAppTheme>) => theme.subtle,
  },
} as const;

/**
 * Alert
 *
 * Inline alert component for displaying messages, warnings, and errors.
 *
 * @example
 * ```tsx
 * <Alert
 *   variant="info"
 *   title="New feature available"
 *   message="Check out the latest update in Settings."
 *   dismissible
 *   onDismiss={() => {}}
 * />
 * ```
 */
export function Alert({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  icon = true,
  style,
  accessibilityLabel,
}: AlertProps) {
  const theme = useAppTheme();
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.getBackgroundColor(),
          borderColor: config.getBorderColor(theme),
          borderRadius: radius.lg,
        },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={config.icon}
            size={iconSize.lg}
            color={config.getIconColor(theme)}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: config.getTitleColor(theme) }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={[styles.message, { color: config.getMessageColor(theme) }]}
              numberOfLines={3}
            >
              {message}
            </Text>
          )}
        </View>
        {dismissible && (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="close"
              size={iconSize.md}
              color={config.getIconColor(theme)}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
