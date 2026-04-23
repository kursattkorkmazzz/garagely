import { BackgroundedIcon } from "@/components/list/backgrounded-icon";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ImagePickerPreviewProps = {
  previewImageUri?: string;
  onPressAddImage?: () => void;
};

export function ImagePickerPreview({
  previewImageUri,
  onPressAddImage,
}: ImagePickerPreviewProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: previewImageUri,
        }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
      <Pressable style={styles.pickerContainer} onPress={onPressAddImage}>
        <BackgroundedIcon
          icon="Camera"
          iconColor={theme.colors.muted}
          size={40}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    height: 200,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderStyle: "dashed",
  },
  pickerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
}));
