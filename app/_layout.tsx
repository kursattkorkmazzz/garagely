import { Button, ButtonText } from "@/components/ui/button";
import "@/styles/global.css";
import { View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        onPress={() => {
          console.log("4e5rfgvb");
        }}
      >
        <ButtonText>Button</ButtonText>
      </Button>
    </View>
  );
}
