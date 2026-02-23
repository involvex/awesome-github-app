import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type AccessibilityState,
} from "react-native";
import {
  touchTarget,
  spacing,
  radius,
  iconSize,
} from "../../lib/design/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Checkbox
 *
 * A checkbox component that supports labels, errors, and accessibility.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Remember me"
 *   checked={rememberMe}
 *   onChange={setRememberMe}
 * />
 * ```
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CheckboxProps) {
  const theme = useAppTheme();

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const accessibilityState: AccessibilityState = {
    checked,
    disabled,
  };

  const checkboxColor = error
    ? theme.danger
    : checked
      ? theme.primary
      : theme.border;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          pressed && !disabled && { opacity: 0.7 },
        ]}
        testID={testID}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: checkboxColor,
              backgroundColor: checked ? checkboxColor : "transparent",
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {checked && (
            <Ionicons
              name="checkmark"
              size={iconSize.sm}
              color="#FFFFFF"
              style={styles.checkIcon}
            />
          )}
        </View>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: error ? theme.danger : theme.text,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
        )}
      </Pressable>
      {error && (
        <Text
          style={[styles.errorText, { color: theme.danger }]}
          numberOfLines={1}
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
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget.min,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    lineHeight: 18,
  },
  label: {
    fontSize: 15,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    marginLeft: 32, // Align with label text (checkbox width + gap)
  },
});
