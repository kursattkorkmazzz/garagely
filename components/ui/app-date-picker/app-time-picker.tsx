import { HOURS_24 } from "@/components/ui/app-date-picker/constants/hours";
import { Minutes } from "@/components/ui/app-date-picker/constants/minute";
import { AppText } from "@/components/ui/app-text";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function AppTimePicker() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContainerContent}
        showsVerticalScrollIndicator={false}
      >
        {HOURS_24.map((hour) => (
          <AppText key={hour}>{hour}</AppText>
        ))}
      </ScrollView>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContainerContent}
        showsVerticalScrollIndicator={false}
      >
        {Minutes.map((minute) => (
          <AppText key={minute}>{minute}</AppText>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    maxHeight: 150,
  },
  scrollContainer: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing.xs,
  },
  scrollContainerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));
