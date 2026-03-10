import {
  AppAvatar,
  AppAvatarFallback,
  AppAvatarImage,
} from "@/components/ui/app-avatar";
import {
  AppCard,
  AppCardAction,
  AppCardDescription,
  AppCardHeader,
  AppCardTitle,
} from "@/components/ui/app-card";
import { AppFlatList } from "@/components/ui/app-flat-list";
import { AppIcon } from "@/components/ui/app-icon";
import {
  AppInput,
  AppInputField,
  AppInputLeftAction,
} from "@/components/ui/app-input-v2";
import { AppText } from "@/components/ui/app-text";
import { AppView } from "@/components/ui/app-view";
import { AppListEmpty } from "@/components/common/list-empty";
import { useThemedStylesheet } from "@/theme/hooks/use-themed-stylesheet";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { useFormikContext } from "formik";
import { useEffect, useState, useCallback } from "react";
import { Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { sdk } from "@/stores/sdk";
import type {
  VehicleBrandModel,
  VehicleModelModel,
} from "@garagely/shared/models/vehicle";
import type { PaginationMeta } from "@garagely/shared/response.types";
import { useI18n } from "@/hooks/use-i18n";
import { useDebounce } from "@/hooks/use-debounce";

type SelectionStep = "brand" | "model";

const PAGE_LIMIT = 20;

type BrandSelectionFormProps = {
  onSwitchManualyButtonClick?: () => void;
};

export function BrandSelectionForm(props: BrandSelectionFormProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const formik = useFormikContext();

  // Selection state
  const [selectionStep, setSelectionStep] = useState<SelectionStep>("brand");
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrandModel | null>(
    null,
  );
  const [selectedModel, setSelectedModel] = useState<VehicleModelModel | null>(
    null,
  );

  // Vehicle Brand Data State
  const [brands, setBrands] = useState<VehicleBrandModel[]>([]);
  const [brandsMeta, setBrandsMeta] = useState<PaginationMeta | null>(null);

  // Vehicle Model Data State
  const [models, setModels] = useState<VehicleModelModel[]>([]);
  const [modelsMeta, setModelsMeta] = useState<PaginationMeta | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Debounce search text
  const debouncedSearch = useDebounce(searchText, 700);

  // Fetch brands
  const fetchBrands = useCallback(
    (search: string, page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      sdk.vehicle.getBrands(
        { search: search || undefined, page, limit: PAGE_LIMIT },
        {
          onSuccess: (response) => {
            if (append) {
              setBrands((prev) => [...(prev ?? []), ...(response.data ?? [])]);
            } else {
              setBrands(response.data ?? []);
            }
            setBrandsMeta(response.meta);
            setIsLoading(false);
            setIsLoadingMore(false);
          },
          onError: (error) => {
            setIsLoading(false);
            setIsLoadingMore(false);
            console.error("Brand Selection Form - Fetch Brands Error", error);
          },
        },
      );
    },
    [],
  );

  // Fetch models
  const fetchModels = useCallback(
    (
      brandId: string,
      search: string,
      page: number,
      append: boolean = false,
    ) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      sdk.vehicle.getModelsByBrand(
        brandId,
        { search: search || undefined, page, limit: PAGE_LIMIT },
        {
          onSuccess: (response) => {
            if (append) {
              setModels((prev) => [...prev, ...response.data]);
            } else {
              setModels(response.data);
            }
            setModelsMeta(response.meta);
            setIsLoading(false);
            setIsLoadingMore(false);
          },
          onError: (error) => {
            setIsLoading(false);
            setIsLoadingMore(false);
            console.error("Brand Selection Form - Fetch Models Error", error);
          },
        },
      );
    },
    [],
  );

  // Fetch brands on mount and when search changes
  useEffect(() => {
    if (selectionStep === "brand") {
      fetchBrands(debouncedSearch, 1);
    }
  }, [debouncedSearch, selectionStep, fetchBrands]);

  // Fetch models when search changes (only in model step)
  useEffect(() => {
    if (selectionStep === "model" && selectedBrand) {
      fetchModels(selectedBrand.id, debouncedSearch, 1);
    }
  }, [debouncedSearch, selectionStep, selectedBrand, fetchModels]);

  // Load more brands
  const handleLoadMoreBrands = useCallback(() => {
    if (brandsMeta?.hasNextPage && !isLoadingMore) {
      fetchBrands(debouncedSearch, brandsMeta.page + 1, true);
    }
  }, [brandsMeta, isLoadingMore, debouncedSearch, fetchBrands]);

  // Load more models
  const handleLoadMoreModels = useCallback(() => {
    if (modelsMeta?.hasNextPage && !isLoadingMore && selectedBrand) {
      fetchModels(selectedBrand.id, debouncedSearch, modelsMeta.page + 1, true);
    }
  }, [modelsMeta, isLoadingMore, selectedBrand, debouncedSearch, fetchModels]);

  // Handle brand selection
  const handleBrandSelect = (brand: VehicleBrandModel) => {
    setSelectedBrand(brand);
    formik.setFieldValue("selectedBrand", brand.id);
    setSearchText("");
    setModels([]);
    setModelsMeta(null);
    setSelectionStep("model");
  };

  // Handle model selection
  const handleModelSelect = (model: VehicleModelModel) => {
    setSelectedModel(model);
    formik.setFieldValue("selectedModel", model.id);
  };

  // Handle back to brands
  const handleBackToBrands = () => {
    setSelectionStep("brand");
    setSelectedBrand(null);
    setSelectedModel(null);
    setModels([]);
    setModelsMeta(null);
    setSearchText("");
    formik.setFieldValue("selectedBrand", "");
    formik.setFieldValue("selectedModel", "");
  };

  const style = useThemedStylesheet((theme) =>
    StyleSheet.create({
      flatListStyle: {
        flex: 1,
        height: "auto",
        borderRadius: radius * 2,
        padding: spacing.md,
      },
      flatListContentContainerStyle: {
        flexGrow: 1,
        gap: spacing.sm,
      },
      backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
      },
      backButtonText: {
        color: theme.primary,
        fontWeight: "600",
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: spacing.xl,
      },
      manualAddCard: {
        borderStyle: "dashed",
        borderColor: theme.primary,
        backgroundColor: theme.background,
      },
      manualAddIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primary,
        alignItems: "center",
        justifyContent: "center",
      },
      manualAddContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
      },
      manualAddTextContainer: {
        flex: 1,
      },
    }),
  );
  // Show loading state
  if (isLoading && brands.length === 0) {
    return (
      <AppView style={style.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </AppView>
    );
  }

  return (
    <>
      {/* Back button when in model step */}
      {selectionStep === "model" && selectedBrand && (
        <Pressable onPress={handleBackToBrands} style={style.backButton}>
          <AppIcon icon="ArrowLeft" size={20} color={theme.primary} />
          <AppText style={style.backButtonText}>{selectedBrand.name}</AppText>
        </Pressable>
      )}

      {/* Search Field */}
      <AppInput
        AppInputField={
          <AppInputField
            placeholder={
              selectionStep === "brand"
                ? t("addVehicle.searchBrand")
                : t("addVehicle.searchModel")
            }
            value={searchText}
            onChangeText={setSearchText}
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="Search" />
              </AppInputLeftAction>
            }
          />
        }
      />

      {/* Loading indicator for model fetch */}
      {isLoading && (
        <AppView style={style.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </AppView>
      )}

      {/* Brand List */}
      {!isLoading && selectionStep === "brand" && (
        <AppFlatList<VehicleBrandModel>
          data={brands}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SelectionListItem
              id={item.id}
              name={item.name}
              photoUrl={item.logoUrl}
              onPress={() => handleBrandSelect(item)}
              isSelected={false}
            />
          )}
          contentContainerStyle={style.flatListContentContainerStyle}
          ListEmptyComponent={() => (
            <AppListEmpty
              icon="Search"
              title={t("addVehicle.noBrandsFound")}
              description={t("addVehicle.noBrandsFoundDescription")}
            />
          )}
          style={style.flatListStyle}
        />
      )}

      {/* Model List */}
      {!isLoading && selectionStep === "model" && (
        <AppFlatList<VehicleModelModel>
          data={models}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SelectionListItem
              id={item.id}
              name={`${item.name}${item.year ? ` (${item.year})` : ""}`}
              onPress={() => handleModelSelect(item)}
              isSelected={item.id === selectedModel?.id}
            />
          )}
          contentContainerStyle={style.flatListContentContainerStyle}
          ListEmptyComponent={() => (
            <AppListEmpty
              icon="Search"
              title={t("addVehicle.noModelsFound")}
              description={t("addVehicle.noModelsFoundDescription")}
            />
          )}
          style={style.flatListStyle}
        />
      )}

      {/* Add Manually Card */}
      <Pressable onPress={() => props.onSwitchManualyButtonClick?.()}>
        <AppCard style={style.manualAddCard}>
          <AppCardHeader>
            <AppView style={style.manualAddContent}>
              <AppView style={style.manualAddIconContainer}>
                <AppIcon
                  icon="Plus"
                  size={20}
                  color={theme.primaryForeground}
                />
              </AppView>
              <AppView style={style.manualAddTextContainer}>
                <AppCardTitle>{t("addVehicle.addManually")}</AppCardTitle>
                <AppCardDescription>
                  {t("addVehicle.addManuallyDescription")}
                </AppCardDescription>
              </AppView>
            </AppView>
            <AppCardAction>
              <AppIcon icon="ChevronRight" size={20} color={theme.primary} />
            </AppCardAction>
          </AppCardHeader>
        </AppCard>
      </Pressable>
    </>
  );
}

type SelectionListItemProps = {
  id: string;
  name: string;
  photoUrl?: string | null;
  onPress: () => void;
  isSelected?: boolean;
};

function SelectionListItem({
  name,
  photoUrl,
  onPress,
  isSelected,
}: SelectionListItemProps) {
  const { theme } = useTheme();

  const style = useThemedStylesheet(
    (theme) =>
      StyleSheet.create({
        cardContainer: {
          borderColor: isSelected ? theme.accent : theme.border,
        },
      }),
    [isSelected],
  );

  return (
    <Pressable onPress={onPress}>
      <AppCard style={style.cardContainer}>
        <AppCardHeader>
          <AppView
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <AppAvatar size="default">
              {photoUrl && <AppAvatarImage src={photoUrl} />}
              <AppAvatarFallback fallbackText={name} />
            </AppAvatar>
            <AppView style={{ flex: 1 }}>
              <AppCardTitle>{name}</AppCardTitle>
            </AppView>
          </AppView>
          {isSelected && (
            <AppCardAction>
              <AppIcon icon="Check" size={20} color={theme.accent} />
            </AppCardAction>
          )}
        </AppCardHeader>
      </AppCard>
    </Pressable>
  );
}
