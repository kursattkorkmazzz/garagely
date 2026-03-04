import { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStore } from "@/stores/root.store";
import { AppText } from "@/components/ui/app-text";
import {
  AppInput,
  InputField,
  InputLeftAction,
} from "@/components/ui/app-input";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";
import type {
  VehicleBrandModel,
  VehicleModelModel,
} from "@garagely/shared/models/vehicle";
import { useFormikContext } from "formik";

type BrandModelStepProps = {
  selectedBrandId: string | null;
  selectedModelId: string | null;
  customBrandName: string;
  customModelName: string;
  isCustomEntry: boolean;
  onBrandSelect: (brand: VehicleBrandModel) => void;
  onModelSelect: (model: VehicleModelModel | null) => void;
  onCustomBrandNameChange: (name: string) => void;
  onCustomModelNameChange: (name: string) => void;
  onCustomEntryChange: (isCustom: boolean) => void;
};

export function BrandModelStepp() {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const {
    brands,
    models,
    isLoadingLookups,
    fetchBrands,
    fetchModelsByBrand,
    clearModels,
  } = useStore((state) => state.vehicle);
  const { values, handleChange, errors } = useFormikContext();

  console.log(values);

  // Brand List View
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  brandRow: {
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  brandItem: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius * 2,
    borderWidth: 1,
    gap: spacing.sm,
  },
  brandLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  brandLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    flex: 1,
  },
  selectedBrandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius * 2,
    marginBottom: spacing.lg,
  },
  selectedBrandInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectedBrandLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  selectedBrandLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius,
    justifyContent: "center",
    alignItems: "center",
  },
  changeBrandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius * 2,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  customEntryButtonContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  cantFindButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius * 2,
    gap: spacing.md,
  },
  cantFindTextContainer: {
    flex: 1,
  },
  customModelContainer: {
    paddingTop: spacing.md,
  },
  customModelTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  customModelSubtitle: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customModelInput: {
    marginBottom: spacing.md,
  },
  backToListButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
});
