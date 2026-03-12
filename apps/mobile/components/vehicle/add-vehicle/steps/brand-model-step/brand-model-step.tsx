import { useEffect } from "react";
import { spacing } from "@/theme/tokens/spacing";
import { useFormikContext } from "formik";
import { AppView } from "@/components/ui/app-view";
// TODO: Re-enable brand selection from list when ready
// import { BrandSelectionForm } from "./components/brand-selection-form";
import { BrandModelManuelEntryForm } from "./components/brand-model-manuel-entry-form";
import { AddVehicleFormState } from "../../add-vehicle-wizard";

type BrandModelStepProps = {};
export function BrandModelStep(_props: BrandModelStepProps) {
  const formik = useFormikContext<AddVehicleFormState>();

  // Always set to custom entry mode (manual entry only for now)
  useEffect(() => {
    formik.setFieldValue("isCustomEntry", true);
  }, []);

  return (
    <AppView
      style={{
        flex: 1,
        gap: spacing.md,
      }}
    >
      {/* Manual Entry Only (Brand selection from list is disabled) */}
      <BrandModelManuelEntryForm />

      {/* TODO: Re-enable brand selection toggle when ready
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
      */}
    </AppView>
  );
}
