import { useMediaPicker } from "@/components/media-picker/use-media-picker";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { Image } from "expo-image";
import { ImagePlus, Pencil } from "lucide-react-native/icons";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type VehicleCoverPhotoFieldProps = {
  previewUri: string | null;
  onUploadComplete: (assetId: string, previewUri: string) => void;
};

export function VehicleCoverPhotoField({
  previewUri,
  onUploadComplete,
}: VehicleCoverPhotoFieldProps) {
  const { t } = useI18n("vehicle");
  const { theme } = useUnistyles();

  const labels = useMemo(
    () => ({
      pickFromLibrary: t("coverPhoto.pickFromLibrary"),
      takePhoto: t("coverPhoto.takePhoto"),
      selectFromGallery: t("coverPhoto.selectFromGallery"),
      uploadWarningTitle: t("coverPhoto.uploadWarningTitle"),
      uploadWarningMessage: t("coverPhoto.uploadWarningMessage"),
      continueText: t("coverPhoto.continue"),
      cancelText: t("coverPhoto.cancel"),
      pickerTitle: t("coverPhoto.pickerTitle"),
    }),
    [t],
  );

  const { open, Modal } = useMediaPicker({
    kind: "image",
    multiple: false,
    aspect: [16, 9],
    allowsEditing: true,
    labels,
  });

  const handleOpen = () => {
    open((assets) => {
      const a = assets[0];
      if (a) onUploadComplete(a.id, a.fullPath);
    });
  };

  return (
    <>
      <Pressable onPress={handleOpen} style={styles.container}>
        <View
          style={[
            styles.photoBox,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.muted,
            },
          ]}
        >
          {previewUri ? (
            <>
              <Image
                source={{ uri: previewUri }}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.editOverlay}>
                <Pressable
                  onPress={handleOpen}
                  style={[
                    styles.editPill,
                    { backgroundColor: theme.colors.card },
                  ]}
                  hitSlop={8}
                >
                  <Pencil size={12} color={theme.colors.foreground} />
                  <AppText
                    style={[
                      styles.editLabel,
                      { color: theme.colors.foreground },
                    ]}
                  >
                    {t("coverPhoto.changePhoto")}
                  </AppText>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <ImagePlus size={32} color={theme.colors.mutedForeground} />
              <AppText
                style={[
                  styles.placeholderText,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {t("coverPhoto.addPhoto")}
              </AppText>
            </View>
          )}
        </View>
      </Pressable>
      {Modal}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
  },
  photoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  editOverlay: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs + 2,
    borderRadius: theme.radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  editLabel: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  placeholderText: {
    ...theme.typography.caption,
  },
}));
