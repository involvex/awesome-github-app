import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../../lib/design/tokens";
import { useAppTheme } from "../../lib/theme";

export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps {
  value: number; // 0-100
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  color?: string;
  accessibilityLabel?: string;
  accessibilityValue?: { now: number; min: number; max: number };
  testID?: string;
}

const sizeConfig = {
  sm: {
    height: 4,
    fontSize: 12,
  },
  md: {
    height: 8,
    fontSize: 14,
  },
  lg: {
    height: 12,
    fontSize: 16,
  },
} as const;

/**
 * Progress
 *
 * A progress bar component with size variants and optional label.
 *
 * @example
 * ```tsx
 * <Progress
 *   value={75}
 *   label="Loading..."
 *   showLabel
 *   size="md"
 * />
 * ```
 */
export function Progress({
  value,
  size = "md",
  showLabel = false,
  label,
  color,
  accessibilityLabel,
  accessibilityValue,
  testID,
}: ProgressProps) {
  const theme = useAppTheme();
  const config = sizeConfig[size];

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  const progressColor = color || theme.primary;
  const trackColor = theme.border;

  const defaultAccessibilityValue = {
    min: 0,
    max: 100,
    now: clampedValue,
  };

  return (
    <View style={styles.container}>
      {(label || showLabel) && (
        <View style={styles.header}>
          {label && (
            <Text
              style={[
                styles.label,
                { color: theme.text, fontSize: config.fontSize },
              ]}
            >
              {label}
            </Text>
          )}
          {showLabel && (
            <Text
              style={[
                styles.percentage,
                { color: theme.subtle, fontSize: config.fontSize },
              ]}
            >
              {Math.round(clampedValue)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height: config.height,
            borderRadius: config.height / 2,
            backgroundColor: trackColor,
          },
        ]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityValue={accessibilityValue || defaultAccessibilityValue}
        testID={testID}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clampedValue}%`,
              borderRadius: config.height / 2,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
  },
  percentage: {
    fontWeight: "600",
  },
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
