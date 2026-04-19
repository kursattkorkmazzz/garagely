import type { DefaultSectionT, SectionListProps } from "react-native";
import { SectionList } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type SelectableItem = { key: string; [others: string]: unknown };

export type SelectSheetPayload<
  ItemT extends SelectableItem = SelectableItem,
  SectionT = DefaultSectionT,
> = SectionListProps<ItemT, SectionT>;

export default function SelectSheet({
  sheetId,
  payload,
}: SheetProps<"select-sheet">) {
  const { theme } = useUnistyles();

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={[
        styles.container,
        { backgroundColor: theme.colors.card },
      ]}
      indicatorStyle={{ backgroundColor: theme.colors.border }}
      gestureEnabled
    >
      <SectionList
        {...payload}
        sections={payload?.sections ?? []}
        keyExtractor={(item) => item.key}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.content}
      />
    </ActionSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  list: {
    maxHeight: 480,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
}));
