import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { STATION_TYPE_META } from "@/features/station/constants/station-type-meta";
import {
  ALL_STATION_TYPES,
  StationType,
} from "@/features/station/types/station-type";
import { useI18n } from "@/i18n";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type StationFilterChipsProps = {
  value: StationType | null;
  onChange: (next: StationType | null) => void;
};

export function StationFilterChips({
  value,
  onChange,
}: StationFilterChipsProps) {
  const { theme } = useUnistyles();
  const { t } = useI18n("station");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Chip
        label={t("filters.all")}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {ALL_STATION_TYPES.map((type) => {
        const meta = STATION_TYPE_META[type];
        const tint = theme.colors.color[meta.color];
        return (
          <Chip
            key={type}
            label={t(`type.${type}`)}
            iconName={meta.icon}
            iconColor={tint}
            selected={value === type}
            onPress={() => onChange(value === type ? null : type)}
          />
        );
      })}
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
  iconName,
  iconColor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  iconName?: import("@/components/ui/icon").IconName;
  iconColor?: string;
}) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.secondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={14}
          color={selected ? theme.colors.primaryForeground : iconColor}
        />
      )}
      <AppText
        style={[
          styles.chipText,
          {
            color: selected
              ? theme.colors.primaryForeground
              : theme.colors.foreground,
          },
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
}));
