import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings" }}
      />
      <Tabs.Screen
        name="features"
        options={{ title: "Features" }}
      />
      <Tabs.Screen
        name="components"
        options={{ title: "Components" }}
      />
    </Tabs>
  );
}
