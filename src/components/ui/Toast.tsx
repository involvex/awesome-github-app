import { View, Animated } from "react-native";
import { ThemedText } from "./ThemedText";
import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onHide: () => void;
};

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <Animated.View
      className={`${bgColors[type]} rounded-xl p-4 m-4 shadow-lg absolute top-0 left-0 right-0 z-50`}
      style={{ opacity }}
    >
      <ThemedText
        variant="body"
        className="text-white"
      >
        {message}
      </ThemedText>
    </Animated.View>
  );
}
