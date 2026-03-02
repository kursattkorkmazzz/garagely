import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
import {
  AppActionSheet,
  ActionSheetOption,
} from "@/components/ui/app-action-sheet";
import { appToast } from "@/components/ui/app-toast";
import { AppSettingsSection, AppSettingsItem } from "@/components/profile";
import { spacing } from "@/theme/tokens/spacing";

export default function ProfileScreen() {
  const { theme, withOpacity } = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.auth.logout);
  const { avatar, isUploadingAvatar, uploadAvatar, removeAvatar } = useStore(
    (state) => state.user,
  );

  useEffect(() => {
    console.log("User is changed");
    console.log(user);
  }, [user]);

  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleUploadAvatar = async (uri: string) => {
    await uploadAvatar(uri, {
      onSuccess: () => {
        appToast.success("Photo updated");
      },
      onError: (message) => {
        appToast.error(message);
      },
    });
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      appToast.error("Camera permission is required to take a photo");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      appToast.error("Gallery permission is required to select a photo");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatar({
      onSuccess: () => {
        appToast.success("Photo removed");
      },
      onError: (message) => {
        appToast.error(message);
      },
    });
  };

  const avatarOptions: ActionSheetOption[] = [
    {
      label: "Take Photo",
      onPress: pickImageFromCamera,
    },
    {
      label: "Choose from Gallery",
      onPress: pickImageFromGallery,
    },
    ...(avatar
      ? [
          {
            label: "Remove Photo",
            onPress: handleRemoveAvatar,
            destructive: true,
          },
        ]
      : []),
  ];

  const handleEditAvatar = () => {
    if (isUploadingAvatar) return;
    setShowActionSheet(true);
  };

  const handleSignOut = async () => {
    await logout();
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
        <Pressable onPress={handleEditAvatar} disabled={isUploadingAvatar}>
          <AppAvatar size="xl">
            <AppAvatarImage src={avatar?.url ?? ""} alt={user?.fullName} />
            <AppAvatarFallback fallbackText={user?.fullName} />
            <AppAvatarBadge>
              <AppIcon
                icon={isUploadingAvatar ? "Loader" : "Pencil"}
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
        variant="ghost"
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

      {/* Avatar Action Sheet */}
      <AppActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Profile Photo"
        options={avatarOptions}
      />
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
