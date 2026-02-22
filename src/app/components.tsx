import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function ComponentsScreen() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.heading}>UI Components</Text>
        <Text style={styles.body}>
          These starter components are generated from the template package.
        </Text>
        <Button title="Primary action" onPress={() => console.log("Pressed")} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 12, color: "#334155" },
});
