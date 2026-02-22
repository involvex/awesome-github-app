import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { ActivityIndicator, View } from "react-native";

export default function OAuthCallbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
