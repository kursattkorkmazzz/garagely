import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
} from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import { useI18n } from "@/i18n";
import ct from "countries-and-timezones";
import { useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";
import ActionSheet, { SheetManager, SheetProps } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SelectItem } from "./components/SelectItem";

type TzItem = { name: string; utcOffsetStr: string; utcOffset: number };

const ALL_TIMEZONES: TzItem[] = Object.values(ct.getAllTimezones())
  .filter((tz) => !tz.deprecated && !tz.aliasOf)
  .sort((a, b) => a.utcOffset - b.utcOffset || a.name.localeCompare(b.name))
  .map((tz) => ({ name: tz.name, utcOffsetStr: tz.utcOffsetStr, utcOffset: tz.utcOffset }));

const PAGE_SIZE = 50;

export type TimezoneSheetPayload = {
  currentTimezone: string;
  onSelect: (tz: string) => void;
};

export default function TimezoneSheet({
  sheetId,
  payload,
}: SheetProps<"timezone-sheet">) {
  const { t } = useI18n("settings");
  const { theme } = useUnistyles();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_TIMEZONES;
    return ALL_TIMEZONES.filter((tz) => tz.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visible = filtered.slice(0, visibleCount);

  const loadMore = () => {
    if (visibleCount < filtered.length) {
      setVisibleCount((c) => c + PAGE_SIZE);
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled
      containerStyle={[styles.container, { backgroundColor: theme.colors.card }]}
      indicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      <AppText style={styles.title}>{t("timezone")}</AppText>

      <AppInputGroup style={styles.search}>
        <AppInputAddon position="left">
          <Icon name="Search" size={16} color={theme.colors.mutedForeground} />
        </AppInputAddon>
        <AppInputField
          value={query}
          onChangeText={setQuery}
          placeholder={t("timezoneSearch")}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </AppInputGroup>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <SelectItem
            label={item.name}
            description={`UTC ${item.utcOffsetStr}`}
            selected={payload?.currentTimezone === item.name}
            onPress={() => {
              payload?.onSelect(item.name);
              SheetManager.hide("timezone-sheet");
            }}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </ActionSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  title: {
    ...theme.typography.rowLabel,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  search: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  list: {
    maxHeight: 420,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
}));
