import { Button, ButtonText } from "@/components/ui/button";
import { LocalizationProvider } from "@/i18n";
import "@/styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

//TODO: Add fade in animation to splash screen at production
/* SplashScreen.setOptions({
  fade: true,
  duration: 1000,
}); */
SplashScreen.preventAutoHideAsync();

function GaragelyApp() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        onPress={() => {
          console.log("Hello World!");
        }}
      >
        <ButtonText>Button</ButtonText>
      </Button>
    </View>
  );
}

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <GaragelyApp />
    </LocalizationProvider>
  );
}
