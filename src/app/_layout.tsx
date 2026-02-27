import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../contexts/ToastContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { queryClient } from "../lib/api/queryClient";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "../lib/theme";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useEffect } from "react";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useAppTheme();

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === "web") return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      if (existingStatus !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    requestPermissions();
  }, []);

  if (isLoading) return null;

  return (
    <>
      <StatusBar style={theme.background === "#0D1117" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "700",
          },
          headerShadowVisible: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen
          name="repo/[owner]/[repo]/index"
          options={{ headerShown: true, title: "Repository" }}
        />
        <Stack.Screen
          name="repo/[owner]/[repo]/settings"
          options={{ headerShown: true, title: "Settings" }}
        />
        <Stack.Screen
          name="repo/[owner]/[repo]/pages"
          options={{ headerShown: true, title: "GitHub Pages" }}
        />
        <Stack.Screen
          name="repo/[owner]/[repo]/workflows"
          options={{ headerShown: true, title: "Actions" }}
        />
        <Stack.Screen
          name="user/[login]"
          options={{ headerShown: true, title: "Profile" }}
        />
        <Stack.Screen
          name="oauth/callback"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
