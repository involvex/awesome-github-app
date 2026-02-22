import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../lib/theme";
import { Image } from "expo-image";

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  borderRadius?: number;
}

export function Avatar({ uri, name, size = 36, borderRadius }: AvatarProps) {
  const theme = useAppTheme();
  const r = borderRadius ?? size / 2;
  const initials = name
    ? name
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: r }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: theme.primary,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontWeight: "700" },
});
