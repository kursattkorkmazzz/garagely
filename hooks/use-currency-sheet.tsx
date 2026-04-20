import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppText } from "@/components/ui/app-text";
import { useI18n } from "@/i18n";
import { CurrencyType, CurrencyTypes } from "@/shared/currency";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import { useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet } from "react-native-unistyles";

type UseCurrencyProps = {
  onCurrencyChange?: (currency: CurrencyType) => void;
};
export function useCurrencySheet(props?: UseCurrencyProps) {
  const { t: tCurrency } = useI18n("currency");
  const storeSelectedCurrency = useUserPreferencesStore(
    (state) => state.currency,
  );
  const [currency, setCurrency] = useState<CurrencyType>(storeSelectedCurrency);

  const openCurrencySheet = () => {
    SheetManager.show("select-sheet", {
      payload: {
        ListHeaderComponent: (
          <AppText style={styles.sheetTitle}>{tCurrency("currency")}</AppText>
        ),
        sections: [
          {
            title: "",
            data: Object.values(CurrencyTypes).map((value) => ({
              key: value,
              label: tCurrency(`${value}.longName`),
              isSelected: currency === value,
              onSelectItem: () => {
                setCurrency(value);
                props?.onCurrencyChange?.(value);
                SheetManager.hide("select-sheet");
              },
            })),
          },
        ],
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label}
            selected={item.isSelected}
            onPress={item.onSelectItem}
          />
        ),
      },
    });
  };

  return {
    selectedCurrency: currency,
    openCurrencySheet,
  };
}

const styles = StyleSheet.create((theme) => ({
  sheetTitle: {
    ...theme.typography.rowLabel,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
}));
