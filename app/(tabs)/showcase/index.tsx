import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldGroup } from "@/components/ui/app-field/app-field-group";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import { AppFieldSeperator } from "@/components/ui/app-field/app-field-seperator";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
} from "@/components/ui/app-input";
import Icon from "@/components/ui/icon";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function ShowcaseScreen() {
  return (
    <View style={styles.container}>
      <AppFieldGroup>
        <AppField>
          <AppFieldLabel>Input with Addon</AppFieldLabel>
          <AppInputGroup size="md">
            <AppInputField />
            <AppInputAddon position="left">
              <Icon name="Plus" />
            </AppInputAddon>
          </AppInputGroup>
        </AppField>
        <AppFieldSeperator />
        <AppField>
          <AppFieldLabel>Input with Addon</AppFieldLabel>

          <AppInputGroup size="md">
            <AppInputField />
            <AppInputAddon position="left">
              <Icon name="Plus" />
            </AppInputAddon>
          </AppInputGroup>
        </AppField>
      </AppFieldGroup>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
}));
