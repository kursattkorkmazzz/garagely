import { AppIcon } from "@/components/ui/app-icon";
import {
  AppInput,
  AppInputErrorMessage,
  AppInputField,
  AppInputLabel,
  AppInputLeftAction,
} from "@/components/ui/app-input-v2";
import { spacing } from "@/theme/tokens/spacing";
import { useFormikContext } from "formik";
import { ScrollView, StyleSheet } from "react-native";
import { AddVehicleFormState } from "../../../add-vehicle-wizard";
import { AppText } from "@/components/ui/app-text";

type BrandModeManuelEntryform = {
  onFindFromListButtonClick?: () => void;
};
export function BrandModelManuelEntryForm(props: BrandModeManuelEntryform) {
  const { handleChange, handleBlur, errors, touched } =
    useFormikContext<AddVehicleFormState>();

  const styles = StyleSheet.create({
    container: {
      display: "flex",
      flexDirection: "column",
      gap: spacing.sm,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppInput
        AppInputLabel={<AppInputLabel>Marka Adı</AppInputLabel>}
        AppInputField={
          <AppInputField
            id="customBrandName"
            placeholder="ex: Porsche"
            onChangeText={handleChange("customBrandName")}
            onBlur={handleBlur("customBrandName")}
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="Building2" />
              </AppInputLeftAction>
            }
          />
        }
        AppInputErrorMessage={
          <AppInputErrorMessage>
            {touched.customBrandName && errors.customBrandName}
          </AppInputErrorMessage>
        }
      />

      <AppInput
        AppInputLabel={<AppInputLabel>Model</AppInputLabel>}
        AppInputField={
          <AppInputField
            id="customModelName"
            placeholder="ex: Taycan"
            onChangeText={handleChange("customModelName")}
            onBlur={handleBlur("customModelName")}
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="Car" />
              </AppInputLeftAction>
            }
          />
        }
        AppInputErrorMessage={
          <AppInputErrorMessage>
            {touched.customModelName && errors.customModelName}
          </AppInputErrorMessage>
        }
      />

      <AppInput
        AppInputLabel={<AppInputLabel>Yıl</AppInputLabel>}
        AppInputField={
          <AppInputField
            id="customYear"
            placeholder="ex: 2025"
            inputMode="numeric"
            onChangeText={handleChange("customYear")}
            onBlur={handleBlur("customYear")}
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="Calendar" />
              </AppInputLeftAction>
            }
          />
        }
        AppInputErrorMessage={
          <AppInputErrorMessage>
            {touched.customYear && errors.customYear}
          </AppInputErrorMessage>
        }
      />
      <AppText
        variant="caption"
        color="accent"
        onPress={() => {
          props.onFindFromListButtonClick?.();
        }}
        style={{
          textAlign: "right",
        }}
      >
        Listeden bul
      </AppText>
    </ScrollView>
  );
}
