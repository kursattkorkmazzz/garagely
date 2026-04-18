import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { ChevronRight } from "lucide-react-native/icons";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {},
}));

export function AppListItem() {
  return (
    <View style={styles.container}>
      <Icon name="Settings" color="#FF0000" />
      <AppText>Language</AppText>
      <ChevronRight />
    </View>
  );
}
