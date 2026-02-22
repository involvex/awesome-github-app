import { View, type ViewProps } from "react-native";

interface ThemedViewProps extends ViewProps {
  className?: string;
}

export function ThemedView({ className = "", ...props }: ThemedViewProps) {
  return (
    <View
      className={`bg-background dark:bg-black ${className}`}
      {...props}
    />
  );
}
