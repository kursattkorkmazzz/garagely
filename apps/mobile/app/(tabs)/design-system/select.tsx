import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import {
  AppSelect,
  AppSelectTrigger,
  AppSelectValue,
  AppSelectContent,
  AppSelectGroup,
  AppSelectItem,
} from "@/components/ui/app-select";
import { spacing } from "@/theme/tokens/spacing";

export default function SelectShowcase() {
  const [theme, setTheme] = useState<string>();
  const [fruit, setFruit] = useState<string>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Basic Select */}
      <View style={styles.section}>
        <AppText variant="heading5">Basic Select</AppText>
        <AppSelect>
          <AppSelectTrigger>
            <AppSelectValue placeholder="Select an option" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup>
              <AppSelectItem value="option1">Option 1</AppSelectItem>
              <AppSelectItem value="option2">Option 2</AppSelectItem>
              <AppSelectItem value="option3">Option 3</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
      </View>

      {/* Controlled Select */}
      <View style={styles.section}>
        <AppText variant="heading5">Controlled Select</AppText>
        <AppText variant="bodySmall" color="muted">
          Selected: {theme ?? "None"}
        </AppText>
        <AppSelect value={theme} onValueChange={setTheme}>
          <AppSelectTrigger>
            <AppSelectValue placeholder="Theme" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup>
              <AppSelectItem value="light">Light</AppSelectItem>
              <AppSelectItem value="dark">Dark</AppSelectItem>
              <AppSelectItem value="system">System</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
      </View>

      {/* With Groups */}
      <View style={styles.section}>
        <AppText variant="heading5">With Groups</AppText>
        <AppText variant="bodySmall" color="muted">
          Selected: {fruit ?? "None"}
        </AppText>
        <AppSelect value={fruit} onValueChange={setFruit}>
          <AppSelectTrigger>
            <AppSelectValue placeholder="Select a fruit" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup label="Citrus">
              <AppSelectItem value="orange">Orange</AppSelectItem>
              <AppSelectItem value="lemon">Lemon</AppSelectItem>
              <AppSelectItem value="grapefruit">Grapefruit</AppSelectItem>
            </AppSelectGroup>
            <AppSelectGroup label="Berries">
              <AppSelectItem value="strawberry">Strawberry</AppSelectItem>
              <AppSelectItem value="blueberry">Blueberry</AppSelectItem>
              <AppSelectItem value="raspberry">Raspberry</AppSelectItem>
            </AppSelectGroup>
            <AppSelectGroup label="Tropical">
              <AppSelectItem value="mango">Mango</AppSelectItem>
              <AppSelectItem value="pineapple">Pineapple</AppSelectItem>
              <AppSelectItem value="banana">Banana</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
      </View>

      {/* With Default Value */}
      <View style={styles.section}>
        <AppText variant="heading5">With Default Value</AppText>
        <AppSelect defaultValue="medium">
          <AppSelectTrigger>
            <AppSelectValue placeholder="Select size" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup>
              <AppSelectItem value="small">Small</AppSelectItem>
              <AppSelectItem value="medium">Medium</AppSelectItem>
              <AppSelectItem value="large">Large</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
      </View>

      {/* Disabled Select */}
      <View style={styles.section}>
        <AppText variant="heading5">Disabled</AppText>
        <AppSelect>
          <AppSelectTrigger disabled>
            <AppSelectValue placeholder="Disabled select" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup>
              <AppSelectItem value="option1">Option 1</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
      </View>

      {/* Disabled Items */}
      <View style={styles.section}>
        <AppText variant="heading5">Disabled Items</AppText>
        <AppSelect>
          <AppSelectTrigger>
            <AppSelectValue placeholder="Some items disabled" />
          </AppSelectTrigger>
          <AppSelectContent>
            <AppSelectGroup>
              <AppSelectItem value="available">Available</AppSelectItem>
              <AppSelectItem value="unavailable" disabled>
                Unavailable
              </AppSelectItem>
              <AppSelectItem value="coming-soon" disabled>
                Coming Soon
              </AppSelectItem>
              <AppSelectItem value="active">Active</AppSelectItem>
            </AppSelectGroup>
          </AppSelectContent>
        </AppSelect>
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
