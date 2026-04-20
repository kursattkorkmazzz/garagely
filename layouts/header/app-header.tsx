import { AppText } from "@/components/ui/app-text";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppHeaderProps = {
  title: string;
};
export function AppHeader(props: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{props.title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  title: {
    color: theme.colors.foreground,
  },
}));
