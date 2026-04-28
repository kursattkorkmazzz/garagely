import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export function usePickedImage(opts?: {
  allowsMultipleSelection?: boolean;
  maxSelectionLimit?: number;
}) {
  const [selectedImageUriList, setSelectedImageUriList] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPreviewImageUri, setSelectedPreviewImageUri] = useState<
    string | undefined
  >(undefined);

  const [remainingSelectionLimit, setRemainingSelectionLimit] =
    useState<number>(opts?.maxSelectionLimit || Infinity);

  const addPickedImage = (imageUri: string[]) => {
    if (imageUri.length === 0) return;

    if (opts?.allowsMultipleSelection) {
      if (imageUri.length > remainingSelectionLimit) return;

      setSelectedImageUriList((prev) => {
        const newSet = new Set(prev);
        imageUri.forEach((uri) => newSet.add(uri));
        return newSet;
      });
      setRemainingSelectionLimit((prev) => prev - imageUri.length);

      if (!selectedPreviewImageUri) {
        setSelectedPreviewImageUri(imageUri[0]);
      }
    } else {
      setSelectedImageUriList(new Set([imageUri[0]]));
      setSelectedPreviewImageUri(imageUri[0]);
    }
  };

  const removePickedImage = (imageUri: string) => {
    setSelectedImageUriList((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageUri);
      return newSet;
    });

    setRemainingSelectionLimit((prev) => prev + 1);

    if (selectedPreviewImageUri === imageUri) {
      if (selectedImageUriList.size > 1) {
        const nextImageUri = Array.from(selectedImageUriList).find(
          (uri) => uri !== imageUri,
        );
        setSelectedPreviewImageUri(nextImageUri);
      } else {
        setSelectedPreviewImageUri(undefined);
      }
    }
  };

  const setPreviewImage = (imageUri: string) => {
    setSelectedPreviewImageUri(imageUri);
  };

  const resetPreviewImage = () => {
    setSelectedPreviewImageUri(undefined);
  };

  const clearPickedImages = () => {
    setSelectedImageUriList(new Set());
    setSelectedPreviewImageUri(undefined);
  };

  const requestGalleryPermission = async () => {
    const currentPermissionStatus =
      await ImagePicker.getMediaLibraryPermissionsAsync();
    if (currentPermissionStatus.granted) return true;

    const permissionRequestResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permissionRequestResult.granted;
  };

  const requestCameraPermission = async () => {
    const currentPermissionStatus =
      await ImagePicker.getCameraPermissionsAsync();
    if (currentPermissionStatus.granted) return true;

    const permissionRequestResult =
      await ImagePicker.requestCameraPermissionsAsync();
    return permissionRequestResult.granted;
  };

  const pickImageFromLibrary = async (
    options?: ImagePicker.ImagePickerOptions,
  ) => {
    const granted = await requestGalleryPermission();
    if (!granted) {
      //TODO: Show user friendly message about permission requirement
      console.log("Permission to access gallery was denied");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      ...options,
      selectionLimit: remainingSelectionLimit,
    });

    if (result.canceled) {
      //Throw error to show user friendly message about cancellation
      console.log("The user cancelled the image picking process");
      return null;
    }

    return result.assets.map((asset) => asset.uri);
  };

  const pickImageFromCamera = async (
    options?: ImagePicker.ImagePickerOptions,
  ) => {
    const granted = await requestCameraPermission();
    if (!granted) {
      //TODO: Show user friendly message about permission requirement
      console.log("Permission to access camera was denied");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      ...options,
      selectionLimit: remainingSelectionLimit,
    });

    if (result.canceled) {
      //Throw error to show user friendly message about cancellation
      console.log("The user cancelled the image picking process");
      return null;
    }

    return result.assets.map((asset) => asset.uri);
  };

  return {
    selectedImageUriList,
    selectedPreviewImageUri,
    addPickedImage,
    removePickedImage,
    setPreviewImage,
    resetPreviewImage,
    clearPickedImages,
    pickImageFromLibrary,
    pickImageFromCamera,
    remainingSelectionLimit,
  };
}
