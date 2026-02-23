import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/(tabs)/feed" : "/(auth)/login");
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
