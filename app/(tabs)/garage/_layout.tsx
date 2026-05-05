import { AppHeader } from "@/layouts/header/app-header";
import { useI18n } from "@/i18n";
import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useUnistyles();
  const { t: tStation } = useI18n("station");

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: "slide_from_bottom",
        animationDuration: 100,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="vehicle/index"
        options={{
          headerShown: true,
          header: (props) => {
            return (
              <AppHeader
                title={"Vehicles"}
                icon="Car"
                goBack={true}
                RightComponent={props.options.headerRight?.({
                  canGoBack: props.navigation.canGoBack(),
                  tintColor: props.options.headerTintColor,
                })}
                {...props}
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="station/[id]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="station/index"
        options={{
          headerShown: true,
          header: (props) => {
            const params =
              (props.route?.params as { type?: string } | undefined) ?? {};
            const type = params.type;
            const title = type
              ? tStation(`type.${type}`)
              : tStation("stations");
            return (
              <AppHeader
                title={title}
                icon="MapPin"
                goBack
                RightComponent={props.options.headerRight?.({
                  canGoBack: props.navigation.canGoBack(),
                  tintColor: props.options.headerTintColor,
                })}
                {...props}
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="station/[id]/station-form"
        options={{
          headerShown: true,
          header: (props) => (
            <AppHeader
              title={tStation("editStation")}
              icon="MapPin"
              goBack
              {...props}
            />
          ),
        }}
      />
    </Stack>
  );
}
