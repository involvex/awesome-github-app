import { View, Pressable, Text, StyleSheet } from "react-native";
import { touchTarget, spacing } from "../../lib/design/tokens";
import { useAppTheme } from "../../lib/theme";

export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioOption<T extends string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  orientation?: RadioGroupOrientation;
  disabled?: boolean;
  error?: string;
  accessibilityLabel?: string;
}

/**
 * RadioGroup
 *
 * A radio button group component with support for descriptions,
 * vertical/horizontal orientation, and accessibility.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Notification frequency"
 *   options={[
 *     { label: "Instant", value: "instant" },
 *     { label: "Daily digest", value: "daily" },
 *     { label: "Weekly", value: "weekly" },
 *   ]}
 *   value={frequency}
 *   onChange={setFrequency}
 * />
 * ```
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  orientation = "vertical",
  disabled = false,
  error,
  accessibilityLabel,
}: RadioGroupProps<T>) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.groupLabel,
            { color: error ? theme.danger : theme.text },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.optionsContainer,
          orientation === "horizontal" && styles.horizontal,
        ]}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel || label}
      >
        {options.map(option => {
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <Pressable
              key={option.value}
              onPress={() => !isOptionDisabled && onChange(option.value)}
              disabled={isOptionDisabled}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{
                selected: isSelected,
                disabled: isOptionDisabled,
              }}
              style={({ pressed }) => [
                styles.optionPressable,
                {
                  opacity: isOptionDisabled ? 0.5 : pressed ? 0.7 : 1,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.labelContainer}>
                  <Text
                    style={[styles.optionLabel, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.subtle },
                      ]}
                      numberOfLines={2}
                    >
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  horizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionPressable: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: touchTarget.min,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  labelContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  errorText: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
