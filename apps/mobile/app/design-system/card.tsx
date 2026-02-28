import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppBadge } from "@/components/ui/app-badge";
import {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardAction,
  AppCardContent,
  AppCardFooter,
} from "@/components/ui/app-card";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";

export default function CardShowcase() {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Basic Card */}
      <View style={styles.section}>
        <AppText variant="heading5">Basic Card</AppText>
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Card Title</AppCardTitle>
            <AppCardDescription>Card Description</AppCardDescription>
          </AppCardHeader>
          <AppCardContent>
            <AppText>This is the card content area.</AppText>
          </AppCardContent>
        </AppCard>
      </View>

      {/* Card with Footer */}
      <View style={styles.section}>
        <AppText variant="heading5">With Footer</AppText>
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Settings</AppCardTitle>
            <AppCardDescription>
              Manage your account settings
            </AppCardDescription>
          </AppCardHeader>
          <AppCardContent>
            <AppText>Update your profile information and preferences.</AppText>
          </AppCardContent>
          <AppCardFooter>
            <AppButton size="sm">Save Changes</AppButton>
            <AppButton variant="ghost" size="sm">
              Cancel
            </AppButton>
          </AppCardFooter>
        </AppCard>
      </View>

      {/* Card with Action */}
      <View style={styles.section}>
        <AppText variant="heading5">With Action</AppText>
        <AppCard>
          <AppCardHeader>
            <View style={{ flex: 1 }}>
              <AppCardTitle>Notifications</AppCardTitle>
              <AppCardDescription>
                You have 3 unread messages
              </AppCardDescription>
            </View>
            <AppCardAction>
              <AppButton variant="ghost" size="icon">
                <AppIcon
                  icon="MoreVertical"
                  size={18}
                  color={theme.foreground}
                />
              </AppButton>
            </AppCardAction>
          </AppCardHeader>
          <AppCardContent>
            <AppText>Check your inbox for new updates.</AppText>
          </AppCardContent>
        </AppCard>
      </View>

      {/* Card with Badge */}
      <View style={styles.section}>
        <AppText variant="heading5">With Badge</AppText>
        <AppCard>
          <AppCardHeader>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <AppCardTitle>Pro Plan</AppCardTitle>
                <AppBadge>Popular</AppBadge>
              </View>
              <AppCardDescription>Best for growing teams</AppCardDescription>
            </View>
          </AppCardHeader>
          <AppCardContent>
            <AppText variant="heading3">$29</AppText>
            <AppText color="muted">per month</AppText>
          </AppCardContent>
          <AppCardFooter>
            <AppButton style={{ flex: 1 }}>Get Started</AppButton>
          </AppCardFooter>
        </AppCard>
      </View>

      {/* Minimal Card */}
      <View style={styles.section}>
        <AppText variant="heading5">Minimal Card</AppText>
        <AppCard>
          <AppCardContent style={{ paddingTop: spacing.md }}>
            <AppText>A simple card with only content.</AppText>
          </AppCardContent>
        </AppCard>
      </View>

      {/* Card List Item */}
      <View style={styles.section}>
        <AppText variant="heading5">List Item Style</AppText>
        <AppCard>
          <AppCardHeader>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
              }}
            >
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <AppIcon
                  icon="User"
                  size={20}
                  color={theme.primaryForeground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppCardTitle>John Doe</AppCardTitle>
                <AppCardDescription>john@example.com</AppCardDescription>
              </View>
            </View>
            <AppCardAction>
              <AppIcon
                icon="ChevronRight"
                size={20}
                color={theme.mutedForeground}
              />
            </AppCardAction>
          </AppCardHeader>
        </AppCard>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
