import { useState } from "react";
import { ScrollView, StyleSheet, Pressable, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFormikContext } from "formik";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import { AppView } from "@/components/ui/app-view";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import {
  AppActionSheet,
  type ActionSheetOption,
} from "@/components/ui/app-action-sheet";
import { appToast } from "@/components/ui/app-toast";
import type { VehicleWizardCommonFields } from "../../../types/vehicle-form.types";

const VIEW_TYPES = [
  "interior",
  "rear",
  "side",
  "front",
  "engine",
  "wheels",
  "other",
] as const;

type ViewType = (typeof VIEW_TYPES)[number];

export function PhotoStep() {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext<VehicleWizardCommonFields>();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [activeTarget, setActiveTarget] = useState<"cover" | ViewType | null>(
    null,
  );

  const additionalPhotosCount = VIEW_TYPES.filter(
    (type) => formik.values.additionalPhotos[type],
  ).length;

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
      aspect: activeTarget === "cover" ? [16, 9] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    setShowActionSheet(false);
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: activeTarget === "cover" ? [16, 9] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const setPhotoUri = (uri: string) => {
    if (activeTarget === "cover") {
      formik.setFieldValue("coverPhotoUri", uri);
    } else if (activeTarget) {
      formik.setFieldValue(`additionalPhotos.${activeTarget}`, uri);
    }
  };

  const handleRemovePhoto = () => {
    setShowActionSheet(false);
    if (activeTarget === "cover") {
      formik.setFieldValue("coverPhotoUri", null);
    } else if (activeTarget) {
      formik.setFieldValue(`additionalPhotos.${activeTarget}`, null);
    }
  };

  const openPicker = (target: "cover" | ViewType) => {
    setActiveTarget(target);
    setShowActionSheet(true);
  };

  const getPhotoUri = (target: "cover" | ViewType): string | null => {
    if (target === "cover") {
      return formik.values.coverPhotoUri;
    }
    return formik.values.additionalPhotos[target];
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

  if (activeTarget && getPhotoUri(activeTarget)) {
    actionSheetOptions.push({
      label: t("common:profile.actionSheets.removePhoto"),
      onPress: handleRemovePhoto,
      destructive: true,
    });
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      gap: spacing.lg,
      paddingBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    coverPhotoContainer: {
      aspectRatio: 16 / 9,
      borderRadius: radius * 2,
      overflow: "hidden",
      backgroundColor: withOpacity(theme.muted, 0.2),
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.border,
    },
    coverPhotoFilled: {
      borderStyle: "solid",
      borderWidth: 0,
    },
    coverImage: {
      width: "100%",
      height: "100%",
    },
    coverPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
    },
    coverIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: withOpacity(theme.primary, 0.1),
      justifyContent: "center",
      alignItems: "center",
    },
    coverActions: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      gap: spacing.xs,
    },
    coverActionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    additionalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    viewSlot: {
      width: "31%",
      aspectRatio: 4 / 3,
      borderRadius: radius * 2,
      overflow: "hidden",
      backgroundColor: withOpacity(theme.muted, 0.2),
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.border,
    },
    viewSlotFilled: {
      borderStyle: "solid",
      borderWidth: 0,
    },
    viewImage: {
      width: "100%",
      height: "100%",
    },
    viewPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.xs,
    },
    viewLabel: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: withOpacity("#000000", 0.6),
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    viewRemoveButton: {
      position: "absolute",
      top: spacing.xs,
      right: spacing.xs,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: withOpacity("#000000", 0.6),
      justifyContent: "center",
      alignItems: "center",
    },
    tipCard: {
      flexDirection: "row",
      backgroundColor: withOpacity(theme.primary, 0.1),
      borderRadius: radius * 2,
      padding: spacing.md,
      gap: spacing.md,
      alignItems: "flex-start",
    },
    tipIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withOpacity(theme.primary, 0.2),
      justifyContent: "center",
      alignItems: "center",
    },
    tipContent: {
      flex: 1,
    },
    optionalBadge: {
      alignItems: "center",
    },
    optionalText: {
      fontWeight: "700",
      textDecorationLine: "underline",
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Optional Badge */}
      <AppView style={styles.optionalBadge}>
        <AppText
          variant="bodySmall"
          color="primary"
          style={styles.optionalText}
        >
          {t("addVehicle.optional")}
        </AppText>
      </AppView>

      {/* Main Exterior View */}
      <AppView>
        <AppView style={styles.sectionHeader}>
          <AppText
            variant="bodySmall"
            color="muted"
            style={styles.sectionTitle}
          >
            {t("addVehicle.mainExteriorView")}
          </AppText>
        </AppView>

        <Pressable
          style={[
            styles.coverPhotoContainer,
            formik.values.coverPhotoUri && styles.coverPhotoFilled,
          ]}
          onPress={() => openPicker("cover")}
        >
          {formik.values.coverPhotoUri ? (
            <>
              <Image
                source={{ uri: formik.values.coverPhotoUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <AppView style={styles.coverActions}>
                <Pressable
                  style={[
                    styles.coverActionButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => openPicker("cover")}
                >
                  <AppIcon icon="Pencil" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[
                    styles.coverActionButton,
                    { backgroundColor: theme.destructive },
                  ]}
                  onPress={() => {
                    formik.setFieldValue("coverPhotoUri", null);
                  }}
                >
                  <AppIcon icon="Trash2" size={18} color="#FFFFFF" />
                </Pressable>
              </AppView>
            </>
          ) : (
            <AppView style={styles.coverPlaceholder}>
              <AppView style={styles.coverIconContainer}>
                <AppIcon icon="Camera" size={28} color={theme.primary} />
              </AppView>
              <AppText variant="bodyMedium" color="muted">
                {t("addVehicle.addCoverPhoto")}
              </AppText>
              <AppText variant="caption" color="muted">
                {t("addVehicle.photoHint")}
              </AppText>
            </AppView>
          )}
        </Pressable>
      </AppView>

      {/* Additional Views */}
      <AppView>
        <AppView style={styles.sectionHeader}>
          <AppText
            variant="bodySmall"
            color="muted"
            style={styles.sectionTitle}
          >
            {t("addVehicle.additionalViews")}
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {t("addVehicle.addedCount", { count: additionalPhotosCount })}
          </AppText>
        </AppView>

        <AppView style={styles.additionalGrid}>
          {VIEW_TYPES.map((viewType) => {
            const photoUri = formik.values.additionalPhotos[viewType];

            return (
              <Pressable
                key={viewType}
                style={[styles.viewSlot, photoUri && styles.viewSlotFilled]}
                onPress={() => openPicker(viewType)}
              >
                {photoUri ? (
                  <>
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.viewImage}
                      resizeMode="cover"
                    />
                    <AppView style={styles.viewLabel}>
                      <AppText variant="caption" style={{ color: "#FFFFFF" }}>
                        {t(`addVehicle.photoViews.${viewType}`)}
                      </AppText>
                    </AppView>
                    <Pressable
                      style={styles.viewRemoveButton}
                      onPress={() => {
                        formik.setFieldValue(
                          `additionalPhotos.${viewType}`,
                          null,
                        );
                      }}
                    >
                      <AppIcon icon="X" size={14} color="#FFFFFF" />
                    </Pressable>
                  </>
                ) : (
                  <AppView style={styles.viewPlaceholder}>
                    <AppIcon
                      icon="Plus"
                      size={24}
                      color={theme.mutedForeground}
                    />
                    <AppText variant="caption" color="muted">
                      {t(`addVehicle.photoViews.${viewType}`)}
                    </AppText>
                  </AppView>
                )}
              </Pressable>
            );
          })}
        </AppView>
      </AppView>

      {/* Photography Tip */}
      <AppView style={styles.tipCard}>
        <AppView style={styles.tipIconContainer}>
          <AppIcon icon="Lightbulb" size={20} color={theme.primary} />
        </AppView>
        <AppView style={styles.tipContent}>
          <AppText
            variant="bodyMedium"
            style={{ fontWeight: "600", marginBottom: spacing.xs }}
          >
            {t("addVehicle.photographyTip.title")}
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {t("addVehicle.photographyTip.text")}
          </AppText>
        </AppView>
      </AppView>

      {/* Action Sheet */}
      <AppActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={
          activeTarget === "cover"
            ? t("addVehicle.coverPhoto")
            : activeTarget
              ? t(`addVehicle.photoViews.${activeTarget}`)
              : ""
        }
        options={actionSheetOptions}
      />
    </ScrollView>
  );
}
