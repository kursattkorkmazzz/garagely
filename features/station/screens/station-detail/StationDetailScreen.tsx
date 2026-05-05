import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppBadge } from "@/components/ui/app-badge";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import Icon from "@/components/ui/icon";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { STATION_TYPE_META } from "@/features/station/constants/station-type-meta";
import { Station } from "@/features/station/entity/station.entity";
import { StationService } from "@/features/station/service/station.service";
import { useI18n } from "@/i18n";
import { useStationStore } from "@/stores/station.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { Play, Star } from "lucide-react-native/icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type StationDetailScreenProps = {
  id: string;
};

export function StationDetailScreen({ id }: StationDetailScreenProps) {
  const { t } = useI18n("station");
  const { theme } = useUnistyles();
  const toggleFavorite = useStationStore((s) => s.toggleFavorite);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      StationService.getById(id).then((s) => {
        setStation(s);
        setLoading(false);
      });
    }, [id]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!station) return null;

  const meta = STATION_TYPE_META[station.type];
  const tint = theme.colors.color[meta.color];
  const cover = station.cover?.fullPath;
  const otherMedia = (station.media ?? []).filter(
    (m) => m.id !== station.coverAssetId,
  );

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleToggleFavorite = () => {
    toggleFavorite(station.id)
      .then(() => {
        // Reload local state copy
        StationService.getById(id).then(setStation);
      })
      .catch(handleUIError);
  };

  const phoneUrl = station.phone
    ? `tel:${station.phone.replace(/\s/g, "")}`
    : null;
  const webUrl = station.website
    ? station.website.startsWith("http")
      ? station.website
      : `https://${station.website}`
    : null;
  const mapUrl =
    station.latitude !== null &&
    station.latitude !== undefined &&
    station.longitude !== null &&
    station.longitude !== undefined
      ? `https://maps.google.com/?q=${station.latitude},${station.longitude}`
      : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              {
                backgroundColor: theme.utils.withOpacity(tint, 0.18),
              },
            ]}
          >
            <Icon name={meta.icon} size={64} color={tint} />
          </View>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <AppText style={styles.name}>{station.name}</AppText>
        <View style={styles.titleMeta}>
          <AppBadge>{t(`type.${station.type}`)}</AppBadge>
          {station.brand ? (
            <AppText style={styles.subText}>{station.brand}</AppText>
          ) : null}
        </View>
        {station.rating ? (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={16}
                color={
                  n <= station.rating!
                    ? theme.colors.primary
                    : theme.colors.mutedForeground
                }
                fill={n <= station.rating! ? theme.colors.primary : "transparent"}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* Favorite */}
      <View style={styles.section}>
        <AppListGroup>
          <AppListItem
            label={t("fields.isFavorite")}
            icon="Star"
            iconColor={
              station.isFavorite
                ? theme.colors.primary
                : theme.colors.mutedForeground
            }
            onPress={handleToggleFavorite}
            trailing={<AppToggle value={station.isFavorite} />}
          />
        </AppListGroup>
      </View>

      {/* Tags */}
      {station.tags && station.tags.length > 0 ? (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("fields.tags")}</AppText>
          <View style={styles.tagWrap}>
            {station.tags.map((tag) => (
              <AppBadge key={tag.id}>{tag.name}</AppBadge>
            ))}
          </View>
        </View>
      ) : null}

      {/* Location */}
      {(station.address || station.city || mapUrl) && (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("sections.location")}</AppText>
          <AppListGroup>
            {station.address ? (
              <AppListItem
                label={t("fields.address")}
                icon="MapPin"
                iconColor={theme.colors.primary}
                sub={station.address}
              />
            ) : null}
            {station.city ? (
              <AppListItem
                label={t("fields.city")}
                icon="Building2"
                iconColor={theme.colors.primary}
                selectedValue={station.city}
              />
            ) : null}
            {mapUrl ? (
              <AppListItem
                label={`${station.latitude}, ${station.longitude}`}
                icon="Navigation"
                iconColor={theme.colors.primary}
                chevron
                onPress={() => openLink(mapUrl)}
              />
            ) : null}
          </AppListGroup>
        </View>
      )}

      {/* Contact */}
      {(phoneUrl || webUrl) && (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("sections.contact")}</AppText>
          <AppListGroup>
            {phoneUrl ? (
              <AppListItem
                label={t("fields.phone")}
                icon="Phone"
                iconColor={theme.colors.primary}
                selectedValue={station.phone ?? ""}
                chevron
                onPress={() => openLink(phoneUrl)}
              />
            ) : null}
            {webUrl ? (
              <AppListItem
                label={t("fields.website")}
                icon="Globe"
                iconColor={theme.colors.primary}
                selectedValue={station.website ?? ""}
                chevron
                onPress={() => openLink(webUrl)}
              />
            ) : null}
          </AppListGroup>
        </View>
      )}

      {/* Notes */}
      {station.notes ? (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("sections.notes")}</AppText>
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <AppText style={{ color: theme.colors.foreground }}>
              {station.notes}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* Other media at bottom */}
      {otherMedia.length > 0 ? (
        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>{t("sections.media")}</AppText>
          <View style={styles.mediaGrid}>
            {otherMedia.map((asset) => {
              const isVideo = asset.type === AssetTypes.VIDEO;
              return (
                <Pressable
                  key={asset.id}
                  onPress={() => openLink(asset.fullPath)}
                  style={[
                    styles.mediaCell,
                    {
                      borderRadius: theme.radius.md,
                      backgroundColor: theme.colors.muted,
                    },
                  ]}
                >
                  {!isVideo ? (
                    <Image
                      source={{ uri: asset.fullPath }}
                      style={styles.mediaImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.videoFallback}>
                      <Play size={28} color={theme.colors.foreground} />
                    </View>
                  )}
                  {isVideo && (
                    <View style={styles.videoBadge}>
                      <Play size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const COLUMN_COUNT = 3;

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.heading2,
    color: theme.colors.foreground,
  },
  titleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  subText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: theme.spacing.xxs,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
    paddingHorizontal: theme.spacing.md + theme.spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  notesBox: {
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  mediaCell: {
    width: `${100 / COLUMN_COUNT - 2}%`,
    aspectRatio: 1,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
}));
