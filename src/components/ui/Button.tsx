import { Pressable, StyleSheet, Text } from "react-native";
import type { PressableProps } from "react-native";

export interface ButtonProps extends PressableProps {
  title: string;
}

export function Button({ title, ...props }: ButtonProps) {
  return (
    <Pressable {...props} style={[styles.button, props.style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
