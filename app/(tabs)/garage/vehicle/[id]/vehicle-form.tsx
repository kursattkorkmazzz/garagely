import { AppText } from "@/components/ui/app-text";
import { AppHeader } from "@/layouts/header/app-header";
import { Stack } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { View } from "react-native";

export default function VehicleForm() {
  const { id } = useLocalSearchParams();
  const isAdding = id === "new";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={isAdding ? "Create Vehicle" : "Edit Vehicle"}
              icon="Car"
              goBack={true}
              {...props}
            />
          ),
        }}
      />
      <View>
        <AppText>Vehicle Form</AppText>
      </View>
    </>
  );
}
