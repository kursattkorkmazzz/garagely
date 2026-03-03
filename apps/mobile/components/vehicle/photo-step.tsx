import { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import { AppActionSheet, type ActionSheetOption } from "@/components/ui/app-action-sheet";
import { appToast } from "@/components/ui/app-toast";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

type PhotoStepProps = {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
};

export function PhotoStep({ photoUri, onPhotoChange }: PhotoStepProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      appToast.error(t("common:toast.cameraPermissionRequired"));
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      appToast.error(t("common:toast.galleryPermissionRequired"));
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setShowActionSheet(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    setShowActionSheet(false);
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
  };

  const actionSheetOptions: ActionSheetOption[] = [
    {
      label: t("common:profile.actionSheets.takePhoto"),
      onPress: handleTakePhoto,
    },
    {
      label: t("common:profile.actionSheets.chooseFromGallery"),
      onPress: handleChooseFromGallery,
    },
  ];

  if (photoUri) {
    actionSheetOptions.push({
      label: t("common:profile.actionSheets.removePhoto"),
      onPress: handleRemovePhoto,
      destructive: true,
    });
  }

  return (
    <View style={styles.container}>
      {/* Skip hint */}
      <View style={[styles.hintContainer, { backgroundColor: withOpacity(theme.primary, 0.1) }]}>
        <AppIcon icon="Info" size={16} color={theme.primary} />
        <AppText variant="bodySmall" color="primary" style={styles.hintText}>
          {t("addVehicle.optionalStepHint")}
        </AppText>
      </View>

      {/* Photo Preview / Upload Area */}
      <Pressable
        onPress={() => setShowActionSheet(true)}
        style={({ pressed }) => [
          styles.uploadArea,
          {
            backgroundColor: photoUri ? "transparent" : withOpacity(theme.muted, 0.2),
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {photoUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <View style={[styles.imageOverlay, { backgroundColor: withOpacity("#000000", 0.4) }]}>
              <AppIcon icon="Camera" size={32} color="#FFFFFF" />
              <AppText variant="bodyMedium" style={{ color: "#FFFFFF" }}>
                {t("addVehicle.tapToChange")}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: withOpacity(theme.primary, 0.1) },
              ]}
            >
              <AppIcon icon="Camera" size={40} color={theme.primary} />
            </View>
            <AppText variant="bodyLarge" style={styles.uploadTitle}>
              {t("addVehicle.addCoverPhoto")}
            </AppText>
            <AppText variant="bodySmall" color="muted" style={styles.uploadSubtitle}>
              {t("addVehicle.photoHint")}
            </AppText>
          </View>
        )}
      </Pressable>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          variant="secondary"
          onPress={() => setShowActionSheet(true)}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <AppIcon icon="Camera" size={18} color={theme.foreground} />
            <AppText variant="bodyMedium">
              {photoUri ? t("addVehicle.changePhoto") : t("addVehicle.selectPhoto")}
            </AppText>
          </View>
        </AppButton>
      </View>

      {/* Action Sheet */}
      <AppActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={t("addVehicle.coverPhoto")}
        options={actionSheetOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius * 2,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  hintText: {
    flex: 1,
  },
  uploadArea: {
    borderRadius: radius * 2,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    aspectRatio: 16 / 9,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    textAlign: "center",
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  button: {
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
