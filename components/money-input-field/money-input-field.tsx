import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import {
  AppInputAddon,
  AppInputField,
  AppInputGroup,
  AppInputText,
} from "@/components/ui/app-input";
import { useCurrencySheet } from "@/hooks/use-currency-sheet";
import { CurrencyType } from "@/shared/currency";
import { ChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type MoneyInputFieldProps = {
  value: string;
  selectedCurrency: CurrencyType;
  placeholder?: string;
  onMoneyChange: (money: number) => void;
  onBlur: (props: any) => void;
  onCurrencyChange: (currency: CurrencyType) => void;
  label: string;
  error?: string;
};
export function MoneyInputField({
  label,
  error,
  selectedCurrency,
  onBlur,
  onMoneyChange,
  onCurrencyChange,
  value,
  placeholder,
}: MoneyInputFieldProps) {
  const { theme } = useUnistyles();

  const currency = useCurrencySheet({
    onCurrencyChange: (currency) => onCurrencyChange(currency),
  });

  const showCurrencySheet = () => {
    currency.openCurrencySheet();
  };

  const onChangeText = (text: string) => {
    // Remove any non-numeric characters except for the decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point is present
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return; // Invalid input, ignore
    }

    onMoneyChange(parseFloat(numericValue));
  };

  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <AppInputGroup>
        <AppInputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType="numeric"
        />
        <AppInputAddon position="right">
          <Pressable onPress={showCurrencySheet} style={styles.currencyAddon}>
            <AppInputText>{selectedCurrency}</AppInputText>
            <ChevronRight size={12} color={theme.colors.mutedForeground} />
          </Pressable>
        </AppInputAddon>
      </AppInputGroup>
      {error && <AppFieldError>{error}</AppFieldError>}
    </AppField>
  );
}

const styles = StyleSheet.create((theme) => ({
  currencyAddon: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.xxs,
  },
}));
