import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { Image } from "expo-image";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type PickedImageListProps = {
  imageUriList: string[];
  onRemoveImage?: (imageUri: string) => void;
  onPressImage?: (imageUri: string) => void;
  totalImageCount?: number;
  selectedImageCount?: number;
};

export function PickedImageList(props: PickedImageListProps) {
  return (
    <View style={styles.container}>
      {typeof props.totalImageCount !== "undefined" &&
        typeof props.selectedImageCount !== "undefined" && (
          <AppText style={styles.countLabel}>
            {props.selectedImageCount}/{props.totalImageCount}
          </AppText>
        )}
      <ScrollView
        horizontal
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContainerContent}
      >
        {props.imageUriList.length === 0 && (
          <AppText style={styles.noContentText}>No images selected.</AppText>
        )}
        {props.imageUriList.map((imageUri) => (
          <PickedImageListItem
            key={imageUri}
            imageUri={imageUri}
            onRemoveImage={props.onRemoveImage}
            onPressImage={props.onPressImage}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type PickedImageListItemProps = {
  imageUri: string;
  onRemoveImage?: (imageUri: string) => void;
  onPressImage?: (imageUri: string) => void;
};
function PickedImageListItem(props: PickedImageListItemProps) {
  const { theme } = useUnistyles();

  const onImagePressHandler = () => {
    if (props.onPressImage) props.onPressImage(props.imageUri);
  };

  const onRemoveImageHandler = () => {
    props.onRemoveImage && props.onRemoveImage(props.imageUri);
  };
  return (
    <Pressable
      style={styles.pickedImageListItemContainer}
      onPress={onImagePressHandler}
    >
      <Image
        source={{
          uri: props.imageUri,
        }}
        style={styles.pickedImageListItemImage}
        contentFit="cover"
      />
      <View style={styles.pickedImageListItemActionContainer}>
        <Pressable
          style={styles.xButonContainer}
          onPress={onRemoveImageHandler}
        >
          <Icon name="X" color={theme.colors.destructiveForeground} size={12} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  countLabel: {
    color: theme.colors.foreground,
  },
  noContentText: {
    color: theme.colors.muted,
    textAlign: "center",
  },
  scrollContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  scrollContainerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  pickedImageListItemContainer: {
    aspectRatio: 1,
  },
  pickedImageListItemActionContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  pickedImageListItemImage: {
    height: 120,
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
  },

  xButonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.destructive,
  },
}));
