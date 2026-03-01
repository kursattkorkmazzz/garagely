import { AppText } from "@/components/ui/app-text";
import { TypographyType, typography } from "@/theme/tokens/typography";
import { ScrollView, StyleSheet, View } from "react-native";

const variants = Object.keys(typography) as TypographyType[];

export default function Typography() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {variants.map((variant) => (
        <View key={variant} style={styles.item}>
          <AppText variant={variant}>{variant}</AppText>
          <AppText variant={variant} style={styles.preview}>
            The quick brown fox jumps over the lazy dog.
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  item: {
    gap: 4,
  },
  preview: {
    opacity: 0.8,
  },
});
