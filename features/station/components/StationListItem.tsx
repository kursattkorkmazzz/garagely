import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { STATION_TYPE_META } from "@/features/station/constants/station-type-meta";
import { Station } from "@/features/station/entity/station.entity";
import { useI18n } from "@/i18n";
import { Image } from "expo-image";
import { ChevronRight, Star } from "lucide-react-native/icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type StationListItemProps = {
  station: Station;
  onPress: (id: string) => void;
};

export function StationListItem({ station, onPress }: StationListItemProps) {
  const { theme } = useUnistyles();
  const { t } = useI18n("station");

  const meta = STATION_TYPE_META[station.type];
  const tint = theme.colors.color[meta.color];
  const cover = station.cover?.fullPath;

  const subParts = [t(`type.${station.type}`)];
  if (station.brand) subParts.push(station.brand);
  if (station.city) subParts.push(station.city);

  return (
    <Pressable
      style={(state) => [
        styles.container,
        state.pressed && { backgroundColor: theme.colors.secondary },
      ]}
      onPress={() => onPress(station.id)}
    >
      <View style={styles.left}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={[styles.thumb, { borderRadius: theme.radius.md }]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.thumb,
              {
                borderRadius: theme.radius.md,
                backgroundColor: theme.utils.withOpacity(tint, 0.14),
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Icon name={meta.icon} color={tint} size={22} />
          </View>
        )}
        <View style={styles.labelStack}>
          <View style={styles.titleRow}>
            <AppText style={styles.name} numberOfLines={1}>
              {station.name}
            </AppText>
            {station.isFavorite && (
              <Star
                size={14}
                color={theme.colors.primary}
                fill={theme.colors.primary}
              />
            )}
          </View>
          <AppText style={styles.sub} numberOfLines={1}>
            {subParts.join(" · ")}
          </AppText>
        </View>
      </View>
      <ChevronRight color={theme.colors.muted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radius.md,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md - 2,
  },
  thumb: {
    width: 42,
    height: 42,
  },
  labelStack: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.rowLabel,
    color: theme.colors.foreground,
    flexShrink: 1,
  },
  sub: {
    ...theme.typography.rowSub,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
}));
