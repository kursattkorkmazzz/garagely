import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppText } from "@/components/ui/app-text";
import { GalleryAssetPickerModal } from "@/features/gallery/components/GalleryAssetPickerModal";
import { useI18n } from "@/i18n";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { Image } from "expo-image";
import { ImagePlus, Pencil } from "lucide-react-native/icons";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
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
  const galleryStore = useGalleryStore();
  const [pickerVisible, setPickerVisible] = useState(false);

  const pickedImageState = usePickedImage({
    allowsMultipleSelection: false,
    maxSelectionLimit: 1,
  });

  const openActionSheet = () => {
    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            data: [
              { key: "library", label: t("coverPhoto.pickFromLibrary") },
              { key: "camera", label: t("coverPhoto.takePhoto") },
              { key: "gallery", label: t("coverPhoto.selectFromGallery") },
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            onPress={() => {
              SheetManager.hide("select-sheet");
              if (item.key === "library") handleUploadFromSource("library");
              if (item.key === "camera") handleUploadFromSource("camera");
              if (item.key === "gallery") setPickerVisible(true);
            }}
          />
        ),
      },
    });
  };

  const handleUploadFromSource = (source: "library" | "camera") => {
    Alert.alert(
      t("coverPhoto.uploadWarningTitle"),
      t("coverPhoto.uploadWarningMessage"),
      [
        { text: t("coverPhoto.cancel"), style: "cancel" },
        {
          text: t("coverPhoto.continue"),
          onPress: () => doUpload(source),
        },
      ],
    );
  };

  const doUpload = async (source: "library" | "camera") => {
    const pickerOpts = {
      allowsEditing: true,
      aspect: [16, 9] as [number, number],
      mediaTypes: ["images"] as ("images" | "videos" | "livePhotos")[],
    };

    const uris =
      source === "library"
        ? await pickedImageState.pickImageFromLibrary(pickerOpts)
        : await pickedImageState.pickImageFromCamera(pickerOpts);

    if (!uris?.[0]) return;

    try {
      const asset = await galleryStore.uploadImageToRoot(uris[0]);
      onUploadComplete(asset.id, asset.fullPath);
    } catch (err) {
      handleUIError(err);
    }
  };

  return (
    <>
      <Pressable onPress={openActionSheet} style={styles.container}>
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
              {/* Edit overlay — sağ alt köşe */}
              <View style={styles.editOverlay}>
                <Pressable
                  onPress={openActionSheet}
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

      <GalleryAssetPickerModal
        visible={pickerVisible}
        title={t("coverPhoto.pickerTitle")}
        onSelect={(asset) => {
          onUploadComplete(asset.id, asset.fullPath);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
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
  // Edit pill — sağ alt
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
  // Placeholder
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
