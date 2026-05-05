import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { AssetService } from "@/features/asset/service/asset.service";
import {
  GalleryAssetPickerFilter,
  GalleryAssetPickerModal,
} from "@/features/gallery/components/GalleryAssetPickerModal";
import { useGalleryStore } from "@/stores/gallery.store";
import { handleUIError } from "@/utils/handle-ui-error";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

export type MediaPickerKind = "image" | "video" | "image-or-video";

export type MediaPickerLabels = {
  pickFromLibrary: string;
  takePhoto: string;
  selectFromGallery: string;
  pickDocument?: string;
  uploadWarningTitle: string;
  uploadWarningMessage: string;
  continueText: string;
  cancelText: string;
  pickerTitle: string;
};

export type UseMediaPickerOptions = {
  kind: MediaPickerKind;
  multiple?: boolean;
  aspect?: [number, number];
  allowsEditing?: boolean;
  /** When true, an extra "Document" entry uploads a PDF via expo-document-picker. */
  withDocument?: boolean;
  labels: MediaPickerLabels;
};

export type UseMediaPickerResult = {
  /**
   * Açar 3-kaynaklı bottom sheet'i. Kullanıcı seçim yapınca callback tetiklenir.
   * Cancel/no-pick durumunda callback çağrılmaz.
   */
  open: (callback: (assets: AssetEntity[]) => void) => void;
  /**
   * Bileşen ağacına yerleştirilecek modal. Her useMediaPicker bir kez render edilmeli.
   */
  Modal: React.ReactElement;
};

const SHEET_ID = "select-sheet";

export function useMediaPicker(
  options: UseMediaPickerOptions,
): UseMediaPickerResult {
  const {
    kind,
    multiple = false,
    aspect,
    allowsEditing = false,
    withDocument = false,
    labels,
  } = options;
  const galleryStore = useGalleryStore();
  const pickerState = usePickedImage({
    allowsMultipleSelection: multiple,
    maxSelectionLimit: multiple ? 10 : 1,
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const callbackRef = useRef<((assets: AssetEntity[]) => void) | null>(null);

  const galleryFilter: GalleryAssetPickerFilter = withDocument
    ? kind === "image-or-video"
      ? "image-or-video-or-document"
      : kind === "image"
      ? "image-or-video-or-document" // allow user to pick docs from gallery too
      : "image-or-video-or-document"
    : kind === "image-or-video"
    ? "image-or-video"
    : kind;

  const mediaTypes: ("images" | "videos")[] =
    kind === "image"
      ? ["images"]
      : kind === "video"
      ? ["videos"]
      : ["images", "videos"];

  const uploadOne = useCallback(
    async (uri: string, type: "image" | "video"): Promise<AssetEntity> => {
      if (type === "video") return galleryStore.uploadVideoToRoot(uri);
      return galleryStore.uploadImageToRoot(uri);
    },
    [galleryStore],
  );

  const guessTypeFromUri = (uri: string): "image" | "video" => {
    const lower = uri.toLowerCase();
    if (lower.match(/\.(mp4|mov|m4v|avi|webm|mkv)(\?|$)/)) return "video";
    return "image";
  };

  const runUpload = useCallback(
    async (source: "library" | "camera") => {
      const opts = {
        allowsEditing,
        aspect,
        mediaTypes,
        allowsMultipleSelection: multiple,
      } as const;

      const uris =
        source === "library"
          ? await pickerState.pickImageFromLibrary(opts)
          : await pickerState.pickImageFromCamera(opts);

      if (!uris || uris.length === 0) return;

      try {
        const assets: AssetEntity[] = [];
        for (const uri of uris) {
          const type =
            kind === "image" || kind === "video" ? kind : guessTypeFromUri(uri);
          const a = await uploadOne(uri, type);
          assets.push(a);
        }
        callbackRef.current?.(assets);
      } catch (err) {
        handleUIError(err);
      }
    },
    [allowsEditing, aspect, kind, mediaTypes, multiple, pickerState, uploadOne],
  );

  const handleUploadFromSource = useCallback(
    (source: "library" | "camera") => {
      Alert.alert(labels.uploadWarningTitle, labels.uploadWarningMessage, [
        { text: labels.cancelText, style: "cancel" },
        { text: labels.continueText, onPress: () => runUpload(source) },
      ]);
    },
    [labels, runUpload],
  );

  const handleUploadDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = await AssetService.uploadDocumentAsset(
        result.assets[0].uri,
        { folderId: null },
      );
      callbackRef.current?.([asset]);
    } catch (err) {
      handleUIError(err);
    }
  }, []);

  const open = useCallback(
    (callback: (assets: AssetEntity[]) => void) => {
      callbackRef.current = callback;
      const data: { key: string; label: string }[] = [
        { key: "library", label: labels.pickFromLibrary },
        { key: "camera", label: labels.takePhoto },
        { key: "gallery", label: labels.selectFromGallery },
      ];
      if (withDocument && labels.pickDocument) {
        data.push({ key: "document", label: labels.pickDocument });
      }
      SheetManager.show(SHEET_ID, {
        payload: {
          sections: [{ data }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem: ({ item }: any) => (
            <SelectItem
              label={item.label as string}
              onPress={() => {
                SheetManager.hide(SHEET_ID);
                if (item.key === "library") handleUploadFromSource("library");
                else if (item.key === "camera") handleUploadFromSource("camera");
                else if (item.key === "gallery") setPickerVisible(true);
                else if (item.key === "document") handleUploadDocument();
              }}
            />
          ),
        },
      });
    },
    [handleUploadFromSource, handleUploadDocument, labels, withDocument],
  );

  const Modal = (
    <GalleryAssetPickerModal
      visible={pickerVisible}
      title={labels.pickerTitle}
      filter={galleryFilter}
      onSelect={(asset) => {
        callbackRef.current?.([asset]);
        setPickerVisible(false);
      }}
      onClose={() => setPickerVisible(false)}
    />
  );

  return { open, Modal };
}
