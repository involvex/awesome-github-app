import {
  View,
  Pressable,
  Text,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { spacing, iconSize } from "../../lib/design/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import { useRouter } from "expo-router";

export interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: HeaderAction;
  subtitle?: string;
  transparent?: boolean;
  elevation?: boolean;
  style?: ViewStyle;
}

/**
 * Header
 *
 * A reusable screen header component with optional back button,
 * subtitle, and right action button.
 *
 * @example
 * ```tsx
 * <Header
 *   title="Settings"
 *   showBackButton
 *   rightAction={{
 *     icon: "ellipsis-horizontal",
 *     onPress: () => {},
 *     accessibilityLabel: "More options",
 *   }}
 * />
 * ```
 */
export function Header({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
  subtitle,
  transparent = false,
  elevation = false,
  style,
}: HeaderProps) {
  const theme = useAppTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent ? "transparent" : theme.surface,
          borderBottomColor: theme.border,
        },
        elevation && styles.elevation,
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={iconSize.md}
                color={theme.text}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.center}>
          <Text
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: theme.subtle }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {rightAction && (
            <Pressable
              onPress={rightAction.onPress}
              accessibilityRole="button"
              accessibilityLabel={rightAction.accessibilityLabel}
              disabled={rightAction.disabled}
              style={({ pressed }) => [
                styles.actionButton,
                rightAction.disabled && { opacity: 0.5 },
                pressed && !rightAction.disabled && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name={rightAction.icon}
                size={iconSize.md}
                color={rightAction.disabled ? theme.muted : theme.text}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  left: {
    width: 32,
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  right: {
    width: 32,
    alignItems: "flex-end",
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
