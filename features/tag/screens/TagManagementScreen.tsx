import { AppListGroup } from "@/components/list/list-group";
import { AppListItem } from "@/components/list/list-item";
import { AppText } from "@/components/ui/app-text";
import Icon from "@/components/ui/icon";
import {
  resolveScopePrefixLabel,
  resolveScopeLabel,
} from "@/features/tag/scope-registry";
import { ScopeUsage, TagService } from "@/features/tag/service/tag.service";
import { useI18n } from "@/i18n";
import { handleUIError } from "@/utils/handle-ui-error";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function TagManagementScreen() {
  const { t } = useI18n("tag");
  const [scopes, setScopes] = useState<ScopeUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    TagService.listScopes()
      .then(setScopes)
      .catch(handleUIError)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  // Group by feature prefix
  const grouped = useMemo(() => {
    const map = new Map<string, ScopeUsage[]>();
    for (const su of scopes) {
      const prefix = su.scope.includes(":")
        ? su.scope.slice(0, su.scope.indexOf(":"))
        : su.scope;
      const arr = map.get(prefix) ?? [];
      arr.push(su);
      map.set(prefix, arr);
    }
    return Array.from(map.entries());
  }, [scopes]);

  const openScope = (scope: string) => {
    router.push({
      pathname: "/(tabs)/settings/tags/[scope]",
      params: { scope },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!loading && scopes.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="Tag" size={48} color="#A8A29E" />
          <AppText style={styles.emptyText}>{t("management.empty")}</AppText>
        </View>
      ) : null}

      {grouped.map(([prefix, items]) => (
        <View key={prefix} style={styles.group}>
          <AppText style={styles.sectionLabel}>
            {resolveScopePrefixLabel(prefix)}
          </AppText>
          <AppListGroup>
            {items.map((it) => (
              <AppListItem
                key={it.scope}
                label={resolveScopeLabel(it.scope)}
                icon="Tag"
                selectedValue={t("management.scopeUsageCount", {
                  count: it.count,
                })}
                chevron
                onPress={() => openScope(it.scope)}
              />
            ))}
          </AppListGroup>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.xs,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.mutedForeground,
    paddingHorizontal: theme.spacing.md + theme.spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.mutedForeground,
  },
}));
