import { AppText } from "@/components/ui/app-text";
import { useAppHeader } from "@/layouts/header/hooks/use-app-header";
import { useEffect } from "react";
import { View } from "react-native";

export default function VehicleList() {
  const appHeader = useAppHeader();

  useEffect(() => {
    appHeader.setHeaderRight(<VehicleListHeaderRightAction />);
    return () => {
      appHeader.resetHeaderRight();
    };
  }, []);

  return (
    <View>
      <AppText>Vehicle List</AppText>
    </View>
  );
}

function VehicleListHeaderRightAction() {
  return <AppText style={{ color: "#FF0000" }}>Right</AppText>;
}
