import { usePickedImage } from "@/components/image-picker/hooks/use-picked-image";
import { ImagePickerPreview } from "@/components/image-picker/image-picker-viewer";
import { PickedImageList } from "@/components/image-picker/picked-image-list";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import {
  CameraType,
  CropShape,
  DefaultTab,
  MediaType,
  UIImagePickerControllerQualityType,
} from "expo-image-picker";
import { useMemo } from "react";
import { View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet } from "react-native-unistyles";

type ImagePickerProps = {
  allowEditing?: boolean;
  allowsMultipleSelection?: boolean;
  aspect?: [number, number];
  cameraType?: CameraType;
  defaultTab?: DefaultTab;
  mediaTypes?: MediaType | MediaType[];
  quality?: number;
  selectionLimit?: number;
  shape?: CropShape;
  videoMaxDuration?: number; // in seconds
  videoQuality?: UIImagePickerControllerQualityType;
};

export function ImagePicker(props: ImagePickerProps) {
  const pickedImageState = usePickedImage({
    allowsMultipleSelection: props.allowsMultipleSelection,
    maxSelectionLimit: props.selectionLimit,
  });

  const imagePickOptions = useMemo(
    () => [
      {
        data: [
          {
            key: "pick-from-device-library",
            label: "Pick from Device Library",
          },
          {
            key: "take-photo",
            label: "Take a Photo",
          },
        ],
      },
    ],
    [],
  );

  const pickImageHandler = () => {
    if (pickedImageState.remainingSelectionLimit <= 0) {
      console.log("Selection limit exceeded.");
      return;
    }
    SheetManager.show("select-sheet", {
      payload: {
        sections: imagePickOptions,
        renderItem: ({ item }) => (
          <SelectItem
            label={item.label as string}
            onPress={async () => {
              let result: string[] | null = null;
              if (item.key === "take-photo") {
                result = await pickedImageState.pickImageFromCamera({
                  ...props,
                });
              } else if (item.key === "pick-from-device-library") {
                result = await pickedImageState.pickImageFromLibrary({
                  ...props,
                });
              }

              pickedImageState.addPickedImage(result || []);
              SheetManager.hide("select-sheet");
            }}
          />
        ),
      },
    });
  };

  console.log(pickedImageState.selectedImageUriList);

  return (
    <View style={styles.container}>
      <ImagePickerPreview
        previewImageUri={pickedImageState.selectedPreviewImageUri}
        onPressAddImage={pickImageHandler}
      />
      {props.allowsMultipleSelection && (
        <PickedImageList
          imageUriList={Array.from(pickedImageState.selectedImageUriList)}
          onRemoveImage={pickedImageState.removePickedImage}
          onPressImage={pickedImageState.setPreviewImage}
          totalImageCount={props.selectionLimit}
          selectedImageCount={pickedImageState.selectedImageUriList.size}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: theme.spacing.sm,
  },
}));
