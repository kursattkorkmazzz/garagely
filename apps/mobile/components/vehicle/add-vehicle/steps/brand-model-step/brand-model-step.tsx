import { useEffect, useState } from "react";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { spacing } from "@/theme/tokens/spacing";
import { useFormikContext } from "formik";
import { AppView } from "@/components/ui/app-view";
import { BrandSelectionForm } from "./components/brand-selection-form";
import { BrandModelManuelEntryForm } from "./components/brand-model-manuel-entry-form";
import { AddVehicleFormState } from "../../add-vehicle-wizard";

type BrandModelStepProps = {};
export function BrandModelStep(props: BrandModelStepProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [isManualEntry, setIsManualEntry] = useState(true);
  const formik = useFormikContext<AddVehicleFormState>();
  useEffect(() => {
    formik.setFieldValue("isCustomEntry", isManualEntry);
  }, [isManualEntry]);

  return (
    <AppView
      style={{
        flex: 1,
        gap: spacing.md,
      }}
    >
      {/* Brand Search Field */}
      {isManualEntry ? (
        <BrandModelManuelEntryForm
          onFindFromListButtonClick={() => {
            setIsManualEntry(false);
          }}
        />
      ) : (
        <BrandSelectionForm
          onSwitchManualyButtonClick={() => {
            setIsManualEntry(true);
          }}
        />
      )}
    </AppView>
  );
}
