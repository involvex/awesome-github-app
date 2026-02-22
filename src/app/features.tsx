import { StyleSheet, Text, View } from "react-native";

const features = [
  "Expo Router navigation",
  "Local Android build workflow",
  "Adaptive light/dark theme",
  "Reusable UI components",
];

export default function FeaturesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Template Features</Text>
      {features.map(feature => (
        <Text
          key={feature}
          style={styles.item}
        >
          â¢ {feature}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  item: { fontSize: 16, color: "#334155" },
});
