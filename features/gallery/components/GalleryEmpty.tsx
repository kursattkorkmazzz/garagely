import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { ImagePlus } from "lucide-react-native/icons";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryEmptyProps = {
  onUpload: () => void;
};

export function GalleryEmpty({ onUpload }: GalleryEmptyProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <ImagePlus size={40} color={theme.colors.mutedForeground} />
      </View>
      <AppText style={styles.title}>{t("empty.title")}</AppText>
      <AppText style={styles.subtitle}>{t("empty.subtitle")}</AppText>
      <AppButton
        variant="primary"
        size="md"
        onPress={onUpload}
        style={styles.button}
      >
        {t("empty.cta")}
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  iconWrapper: {
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.heading3,
    color: theme.colors.foreground,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.md,
    minWidth: 140,
  },
}));
