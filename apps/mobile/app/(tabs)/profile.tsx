import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/theme-context";
import { useStore } from "@/stores";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppBadge } from "@/components/ui/app-badge";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppAvatar,
  AppAvatarImage,
  AppAvatarFallback,
  AppAvatarBadge,
} from "@/components/ui/app-avatar";
import { AppSettingsSection, AppSettingsItem } from "@/components/profile";
import { spacing } from "@/theme/tokens/spacing";

export default function ProfileScreen() {
  const { theme, withOpacity } = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.auth.logout);

  console.log(user);

  const handleEditAvatar = () => {
    // TODO: Implement avatar edit
  };

  const handleSignOut = () => {
    logout();
    router.replace("/(auth)");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <Pressable onPress={handleEditAvatar}>
          <AppAvatar size="xl">
            <AppAvatarImage src="" alt={user?.fullName} />
            <AppAvatarFallback fallbackText={user?.fullName} />
            <AppAvatarBadge>
              <AppIcon
                icon="Pencil"
                size={12}
                color={theme.primaryForeground}
              />
            </AppAvatarBadge>
          </AppAvatar>
        </Pressable>

        <AppText variant="heading3" style={styles.name}>
          {user?.fullName ?? "User"}
        </AppText>
        <AppText variant="bodyMedium" color="muted">
          {user?.email ?? ""}
        </AppText>

        <AppBadge variant="default" style={styles.badge}>
          FLEET PLAN
        </AppBadge>
      </View>

      {/* Subscription */}
      <AppSettingsSection title="SUBSCRIPTION">
        <AppSettingsItem
          icon="Star"
          iconColor="#F59E0B"
          iconBackgroundColor={withOpacity("#F59E0B", 0.15)}
          title="Manage Plan"
          subtitle="Next billing on Nov 12, 2023"
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* App Settings */}
      <AppSettingsSection title="APP SETTINGS">
        <AppSettingsItem
          icon="Globe"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title="Language"
          value="English (US)"
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="Moon"
          iconColor="#8B5CF6"
          iconBackgroundColor={withOpacity("#8B5CF6", 0.15)}
          title="Appearance"
          value="System"
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Notifications */}
      <AppSettingsSection title="NOTIFICATIONS">
        <AppSettingsItem
          icon="Bell"
          iconColor="#EF4444"
          iconBackgroundColor={withOpacity("#EF4444", 0.15)}
          title="Push Notifications"
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="Mail"
          iconColor="#10B981"
          iconBackgroundColor={withOpacity("#10B981", 0.15)}
          title="Email Alerts"
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Security */}
      <AppSettingsSection title="SECURITY">
        <AppSettingsItem
          icon="KeyRound"
          iconColor="#F97316"
          iconBackgroundColor={withOpacity("#F97316", 0.15)}
          title="Change Password"
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="Fingerprint"
          iconColor="#06B6D4"
          iconBackgroundColor={withOpacity("#06B6D4", 0.15)}
          title="Biometric Auth"
          accessory="switch"
          switchValue={false}
          onSwitchChange={() => {
            console.log("Clicked");
          }}
        />
      </AppSettingsSection>

      {/* Data & Privacy */}
      <AppSettingsSection title="DATA & PRIVACY">
        <AppSettingsItem
          icon="Shield"
          iconColor="#6366F1"
          iconBackgroundColor={withOpacity("#6366F1", 0.15)}
          title="Privacy Policy"
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="BarChart3"
          iconColor="#EC4899"
          iconBackgroundColor={withOpacity("#EC4899", 0.15)}
          title="Data Usage"
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Support */}
      <AppSettingsSection title="SUPPORT">
        <AppSettingsItem
          icon="CircleHelp"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title="Help Center"
          onPress={() => {}}
        />
        <AppSettingsItem
          icon="MessageSquare"
          iconColor="#3B82F6"
          iconBackgroundColor={withOpacity("#3B82F6", 0.15)}
          title="Contact Support"
          onPress={() => {}}
        />
      </AppSettingsSection>

      {/* Sign Out */}
      <AppButton
        variant="secondary"
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        <View style={styles.signOutContent}>
          <AppIcon icon="LogOut" size={18} color={theme.destructive} />
          <AppText style={{ color: theme.destructive, fontWeight: "600" }}>
            SIGN OUT
          </AppText>
        </View>
      </AppButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  name: {
    marginTop: spacing.md,
  },
  badge: {
    marginTop: spacing.md,
    alignSelf: "center",
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  signOutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
