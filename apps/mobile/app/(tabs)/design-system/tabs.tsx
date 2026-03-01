import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import {
  AppTabs,
  AppTabList,
  AppTabTrigger,
  AppTabContent,
} from "@/components/ui/app-tabs";
import {
  AppInput,
  InputField,
  InputLeftAction,
} from "@/components/ui/app-input";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";

export default function TabsShowcase() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Basic Tabs */}
      <View style={styles.section}>
        <AppText variant="heading5">Basic Tabs</AppText>
        <AppTabs defaultValue="tab1">
          <AppTabList>
            <AppTabTrigger value="tab1">Tab 1</AppTabTrigger>
            <AppTabTrigger value="tab2">Tab 2</AppTabTrigger>
          </AppTabList>
          <AppTabContent value="tab1" style={styles.content}>
            <AppText>Content for Tab 1</AppText>
          </AppTabContent>
          <AppTabContent value="tab2" style={styles.content}>
            <AppText>Content for Tab 2</AppText>
          </AppTabContent>
        </AppTabs>
      </View>

      {/* Three Tabs */}
      <View style={styles.section}>
        <AppText variant="heading5">Three Tabs</AppText>
        <AppTabs defaultValue="overview">
          <AppTabList>
            <AppTabTrigger value="overview">Overview</AppTabTrigger>
            <AppTabTrigger value="details">Details</AppTabTrigger>
            <AppTabTrigger value="reviews">Reviews</AppTabTrigger>
          </AppTabList>
          <AppTabContent value="overview" style={styles.content}>
            <AppText>Overview content goes here.</AppText>
          </AppTabContent>
          <AppTabContent value="details" style={styles.content}>
            <AppText>Details content goes here.</AppText>
          </AppTabContent>
          <AppTabContent value="reviews" style={styles.content}>
            <AppText>Reviews content goes here.</AppText>
          </AppTabContent>
        </AppTabs>
      </View>

      {/* Auth Example (Sign In / Sign Up) */}
      <View style={styles.section}>
        <AppText variant="heading5">Auth Example</AppText>
        <AppTabs defaultValue="signin">
          <AppTabList>
            <AppTabTrigger value="signin">Sign In</AppTabTrigger>
            <AppTabTrigger value="signup">Sign Up</AppTabTrigger>
          </AppTabList>
          <AppTabContent value="signin" style={styles.content}>
            <View style={styles.form}>
              <AppInput>
                <InputLeftAction>
                  <AppIcon
                    icon="Mail"
                    size={20}
                    color={theme.mutedForeground}
                  />
                </InputLeftAction>
                <InputField
                  placeholder="Email address"
                  keyboardType="email-address"
                />
              </AppInput>
              <AppInput>
                <InputLeftAction>
                  <AppIcon
                    icon="Lock"
                    size={20}
                    color={theme.mutedForeground}
                  />
                </InputLeftAction>
                <InputField placeholder="Password" secureTextEntry />
              </AppInput>
            </View>
          </AppTabContent>
          <AppTabContent value="signup" style={styles.content}>
            <View style={styles.form}>
              <AppInput>
                <InputLeftAction>
                  <AppIcon
                    icon="User"
                    size={20}
                    color={theme.mutedForeground}
                  />
                </InputLeftAction>
                <InputField placeholder="Full name" />
              </AppInput>
              <AppInput>
                <InputLeftAction>
                  <AppIcon
                    icon="Mail"
                    size={20}
                    color={theme.mutedForeground}
                  />
                </InputLeftAction>
                <InputField
                  placeholder="Email address"
                  keyboardType="email-address"
                />
              </AppInput>
              <AppInput>
                <InputLeftAction>
                  <AppIcon
                    icon="Lock"
                    size={20}
                    color={theme.mutedForeground}
                  />
                </InputLeftAction>
                <InputField placeholder="Password" secureTextEntry />
              </AppInput>
            </View>
          </AppTabContent>
        </AppTabs>
      </View>

      {/* With onValueChange callback */}
      <View style={styles.section}>
        <AppText variant="heading5">With Callback</AppText>
        <AppText variant="bodySmall" color="muted">
          Active tab: {activeTab}
        </AppText>
        <AppTabs defaultValue="tab1" onValueChange={setActiveTab}>
          <AppTabList>
            <AppTabTrigger value="tab1">First</AppTabTrigger>
            <AppTabTrigger value="tab2">Second</AppTabTrigger>
          </AppTabList>
          <AppTabContent value="tab1" style={styles.content}>
            <AppText>First tab is selected</AppText>
          </AppTabContent>
          <AppTabContent value="tab2" style={styles.content}>
            <AppText>Second tab is selected</AppText>
          </AppTabContent>
        </AppTabs>
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
  content: {
    paddingTop: spacing.md,
  },
  form: {
    gap: spacing.sm,
  },
});
