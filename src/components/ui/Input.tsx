import { TextInput, type TextInputProps, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <ThemedText
          variant="caption"
          className="mb-2"
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 ${error ? "border-red-500" : ""} ${className}`}
        placeholderTextColor="#8e8e93"
        {...props}
      />
      {error && (
        <ThemedText
          variant="caption"
          className="text-red-500 mt-1"
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}
