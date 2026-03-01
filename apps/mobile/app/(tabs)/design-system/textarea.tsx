import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppTextarea } from "@/components/ui/app-textarea";
import { spacing } from "@/theme/tokens/spacing";

export default function TextareaShowcase() {
  const [value, setValue] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Textarea */}
      <View style={styles.section}>
        <AppText variant="heading5">Default Textarea</AppText>
        <AppTextarea placeholder="Type your message here." />
      </View>

      {/* Controlled Textarea */}
      <View style={styles.section}>
        <AppText variant="heading5">Controlled Textarea</AppText>
        <AppText variant="bodySmall" color="muted">
          Characters: {value.length}
        </AppText>
        <AppTextarea
          placeholder="Type something..."
          value={value}
          onChangeText={setValue}
        />
      </View>

      {/* Invalid State */}
      <View style={styles.section}>
        <AppText variant="heading5">Invalid State</AppText>
        <AppText variant="bodySmall" color="muted">
          Border shows destructive color
        </AppText>
        <AppTextarea
          placeholder="This field has an error..."
          invalid
        />
      </View>

      {/* Disabled State */}
      <View style={styles.section}>
        <AppText variant="heading5">Disabled State</AppText>
        <AppTextarea
          placeholder="This field is disabled..."
          editable={false}
          style={{ opacity: 0.5 }}
        />
      </View>

      {/* Custom Height */}
      <View style={styles.section}>
        <AppText variant="heading5">Custom Height</AppText>
        <AppTextarea
          placeholder="Taller textarea..."
          style={{ minHeight: 150 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
});
