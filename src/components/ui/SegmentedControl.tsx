import {
  View,
  Pressable,
  Text,
  StyleSheet,
  type AccessibilityState,
} from "react-native";
import { touchTarget, radius, spacing } from "../../lib/design/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import { useMemo } from "react";

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const sizeConfig = {
  sm: {
    height: 32,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    iconSize: 14,
    gap: 4,
  },
  md: {
    height: 40,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    iconSize: 18,
    gap: 6,
  },
  lg: {
    height: 48,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    iconSize: 20,
    gap: 8,
  },
} as const;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useAppTheme();
  const config = sizeConfig[size];

  // Calculate width for each segment when not full width
  const segmentWidth = useMemo(() => {
    if (fullWidth) return undefined;
    const baseWidth = options.length * 100;
    return Math.max(baseWidth, 120);
  }, [options.length, fullWidth]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceDisabled,
          borderRadius: radius.xl,
          height: config.height,
        },
        fullWidth && styles.fullWidth,
      ]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        const accessibilityState: AccessibilityState = {
          selected: isSelected,
          disabled: option.disabled,
        };

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={accessibilityState}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              {
                width: segmentWidth,
                paddingHorizontal: config.paddingHorizontal,
                backgroundColor: isSelected ? theme.surface : "transparent",
                opacity: pressed && !option.disabled ? 0.8 : 1,
                borderTopLeftRadius: isFirst ? radius.xl : radius.md,
                borderBottomLeftRadius: isFirst ? radius.xl : radius.md,
                borderTopRightRadius: isLast ? radius.xl : radius.md,
                borderBottomRightRadius: isLast ? radius.xl : radius.md,
              },
            ]}
          >
            <View style={[styles.segmentContent, { gap: config.gap }]}>
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={config.iconSize}
                  color={isSelected ? theme.text : theme.subtle}
                />
              )}
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: config.fontSize,
                    color: isSelected ? theme.text : theme.subtle,
                  },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    alignSelf: "flex-start",
  },
  fullWidth: {
    width: "100%",
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: touchTarget.sm,
  },
  segmentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
  },
});
