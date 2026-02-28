import { AppText } from "@/components/ui/app-text";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View>
      <AppText variant="heading1">Welcome to Garagely</AppText>
      <AppText variant="bodyLarge">
        This is a sample app to demonstrate the typography system.
      </AppText>
      <AppText variant="bodyMedium">
        You can customize the font sizes using the typography tokens.
      </AppText>
      <AppText variant="bodySmall">
        This is a smaller text for secondary information.
      </AppText>

      <AppText variant="kbd">CMD + A</AppText>
    </View>
  );
}
