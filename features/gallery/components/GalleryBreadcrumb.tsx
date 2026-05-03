import { AppText } from "@/components/ui/app-text";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { useI18n } from "@/i18n";
import { ChevronRight } from "lucide-react-native/icons";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type GalleryBreadcrumbProps = {
  path: MediaFolderEntity[];              // [root, ..., current], empty = at root
  onNavigate: (folderId: string | null) => void;
};

export function GalleryBreadcrumb({ path, onNavigate }: GalleryBreadcrumbProps) {
  const { t } = useI18n("gallery");
  const { theme } = useUnistyles();

  const isAtRoot = path.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {/* Root item — "Tüm Dosyalar" */}
      <Pressable
        onPress={() => !isAtRoot && onNavigate(null)}
        disabled={isAtRoot}
        style={styles.item}
      >
        <AppText
          style={[
            styles.label,
            {
              color: isAtRoot
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
              fontWeight: isAtRoot ? "600" : "400",
            },
          ]}
        >
          {t("folders.allFiles")}
        </AppText>
      </Pressable>

      {/* Klasör path öğeleri */}
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        return (
          <View key={folder.id} style={styles.segment}>
            <ChevronRight
              size={14}
              color={theme.colors.mutedForeground}
              style={styles.chevron}
            />
            <Pressable
              onPress={() => !isLast && onNavigate(folder.id)}
              disabled={isLast}
              style={styles.item}
            >
              <AppText
                style={[
                  styles.label,
                  {
                    color: isLast
                      ? theme.colors.foreground
                      : theme.colors.mutedForeground,
                    fontWeight: isLast ? "600" : "400",
                  },
                ]}
                numberOfLines={1}
              >
                {folder.name}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 0,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    marginHorizontal: 2,
  },
  item: {
    paddingVertical: 2,
    maxWidth: 140,
  },
  label: {
    ...theme.typography.bodyMedium,
  },
}));
