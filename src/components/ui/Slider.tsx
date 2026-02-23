import {
  View,
  Pressable,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  type LayoutChangeEvent,
} from "react-native";
import { touchTarget, spacing } from "../../lib/design/tokens";
import { useAppTheme } from "../../lib/theme";
import React, { useState } from "react";

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  size?: SliderSize;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const sizeConfig = {
  sm: {
    trackHeight: 4,
    thumbSize: 16,
    fontSize: 13,
  },
  md: {
    trackHeight: 6,
    thumbSize: 20,
    fontSize: 15,
  },
  lg: {
    trackHeight: 8,
    thumbSize: 24,
    fontSize: 16,
  },
} as const;

/**
 * Slider
 *
 * A range slider component with step support and value display.
 *
 * @example
 * ```tsx
 * <Slider
 *   label="Font size"
 *   value={fontSize}
 *   onChange={setFontSize}
 *   min={12}
 *   max={24}
 *   step={1}
 *   showValue
 * />
 * ```
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  size = "md",
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: SliderProps) {
  const theme = useAppTheme();
  const config = sizeConfig[size];
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedValue = useState(new Animated.Value(value))[0];

  // Clamp value between min and max
  const clampedValue = Math.max(min, Math.min(max, value));

  // Calculate position as percentage
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Update animated value when value changes
  React.useEffect(() => {
    animatedValue.setValue(clampedValue);
  }, [clampedValue, animatedValue]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width - config.thumbSize);
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        // Initialize pan
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;

        const newValue =
          min + (gestureState.moveX / containerWidth) * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        const clampedNewValue = Math.max(min, Math.min(max, steppedValue));
        onChange(clampedNewValue);
      },
      onPanResponderRelease: () => {
        // Finalize value
      },
    }),
  ).current;

  const accessibilityValue = {
    min,
    max,
    now: clampedValue,
  };

  return (
    <View style={styles.container}>
      {(label || showValue) && (
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
          {showValue && (
            <Text
              style={[
                styles.value,
                { color: theme.subtle, fontSize: config.fontSize },
              ]}
            >
              {clampedValue}
            </Text>
          )}
        </View>
      )}
      <View
        style={[styles.sliderContainer, disabled && styles.disabled]}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.track,
            {
              height: config.trackHeight,
              borderRadius: config.trackHeight / 2,
              backgroundColor: disabled ? theme.surfaceDisabled : theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                borderRadius: config.trackHeight / 2,
                backgroundColor: disabled ? theme.muted : theme.primary,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.thumb,
            {
              width: config.thumbSize,
              height: config.thumbSize,
              borderRadius: config.thumbSize / 2,
              backgroundColor: disabled ? theme.muted : theme.primary,
              left: `${percentage}%`,
              marginLeft: -config.thumbSize / 2,
            },
          ]}
        />
        {/* Invisible hit area for larger touch target */}
        <Pressable
          disabled={disabled}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityValue={accessibilityValue}
          style={styles.hitArea}
          onPressIn={event => {
            if (disabled) return;
            const { locationX } = event.nativeEvent;
            const newValue = min + (locationX / containerWidth) * (max - min);
            const steppedValue = Math.round(newValue / step) * step;
            const clampedNewValue = Math.max(min, Math.min(max, steppedValue));
            onChange(clampedNewValue);
          }}
          testID={testID}
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
  value: {
    fontWeight: "600",
  },
  sliderContainer: {
    height: touchTarget.min,
    justifyContent: "center",
    position: "relative",
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  thumb: {
    position: "absolute",
    top: "50%",
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  hitArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
