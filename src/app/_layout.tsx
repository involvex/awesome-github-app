import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../contexts/ToastContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { queryClient } from "../lib/api/queryClient";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <RootLayoutNav />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
