import { GalleryScreen } from "@/features/gallery/screens/GalleryScreen";
import { AppHeader } from "@/layouts/header/app-header";
import { Stack } from "expo-router";

export default function GalleryPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader title={"Gallery"} icon="Car" goBack={true} {...props} />
          ),
        }}
      />
      <GalleryScreen />
    </>
  );
}
