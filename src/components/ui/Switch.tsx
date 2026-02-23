import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Animated,
  type AccessibilityState,
} from "react-native";
import { touchTarget, spacing } from "../../lib/design/tokens";
import { useAppTheme } from "../../lib/theme";
import React from "react";

export type SwitchSize = "sm" | "md";

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: SwitchSize;
  error?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const sizeConfig = {
  sm: {
    width: 44,
    height: 24,
    thumbSize: 20,
    trackPadding: 2,
  },
  md: {
    width: 51,
    height: 28,
    thumbSize: 24,
    trackPadding: 2,
  },
} as const;

/**
 * Switch
 *
 * A toggle switch component with consistent design system styling.
 *
 * @example
 * ```tsx
 * <Switch
 *   label="Push notifications"
 *   value={pushEnabled}
 *   onValueChange={setPushEnabled}
 * />
 * ```
 */
export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  size = "md",
  error,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: SwitchProps) {
  const theme = useAppTheme();
  const config = sizeConfig[size];
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, animatedValue]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const accessibilityState: AccessibilityState = {
    checked: value,
    disabled,
  };

  const thumbTranslate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      config.trackPadding,
      config.width - config.thumbSize - config.trackPadding,
    ],
  });

  const trackColor = value ? theme.primary : theme.border;
  const thumbColor = value ? "#FFFFFF" : theme.muted;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          label && styles.withLabel,
          pressed && !disabled && styles.pressed,
        ]}
        testID={testID}
      >
        <View
          style={[
            styles.track,
            {
              width: config.width,
              height: config.height,
              borderRadius: config.height / 2,
              backgroundColor: disabled ? theme.surfaceDisabled : trackColor,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: config.thumbSize,
                height: config.thumbSize,
                borderRadius: config.thumbSize / 2,
                backgroundColor: thumbColor,
                transform: [{ translateX: thumbTranslate }],
              },
            ]}
          />
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
    alignSelf: "flex-start",
  },
  withLabel: {
    minHeight: touchTarget.min,
  },
  pressed: {
    opacity: 0.7,
  },
  track: {
    justifyContent: "center",
    padding: 2,
  },
  thumb: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    marginLeft: 60, // Align with label text
  },
});
