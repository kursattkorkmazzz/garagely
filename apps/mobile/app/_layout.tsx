import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaView>
      <Text>Hello World</Text>
      <StatusBar animated />
    </SafeAreaView>
  );
}
