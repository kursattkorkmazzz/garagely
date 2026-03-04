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

export function BrandModelStep({
  selectedBrandId,
  selectedModelId,
  customBrandName,
  customModelName,
  isCustomEntry,
  onBrandSelect,
  onModelSelect,
  onCustomBrandNameChange,
  onCustomModelNameChange,
  onCustomEntryChange,
}: BrandModelStepProps) {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showModels, setShowModels] = useState(false);

  useEffect(() => {
    if (brands.length === 0) {
      fetchBrands();
    }
  }, [brands.length, fetchBrands]);

  useEffect(() => {
    if (selectedBrandId && !isCustomEntry) {
      setShowModels(true);
      fetchModelsByBrand(selectedBrandId);
    } else if (!isCustomEntry) {
      setShowModels(false);
      clearModels();
    }
  }, [selectedBrandId, isCustomEntry, fetchModelsByBrand, clearModels]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [brands, searchQuery]);

  const selectedBrand = useMemo(
    () => brands.find((b) => b.id === selectedBrandId),
    [brands, selectedBrandId],
  );

  const handleBrandPress = (brand: VehicleBrandModel) => {
    onBrandSelect(brand);
    onModelSelect(null);
    onCustomBrandNameChange("");
    onCustomModelNameChange("");
    onCustomEntryChange(false);
    setSearchQuery("");
  };

  const handleBackToBrands = () => {
    setShowModels(false);
    onCustomBrandNameChange("");
    onCustomModelNameChange("");
    onCustomEntryChange(false);
    clearModels();
  };

  const handleShowCustomEntry = () => {
    onCustomEntryChange(true);
    onModelSelect(null);
    // Pre-fill with search query if user was searching
    if (searchQuery) {
      onCustomBrandNameChange(searchQuery);
      setSearchQuery("");
    }
    setShowModels(false);
    clearModels();
  };

  const handleBackToList = () => {
    onCustomEntryChange(false);
    onCustomBrandNameChange("");
    onCustomModelNameChange("");
  };

  const handleModelSelect = (model: VehicleModelModel) => {
    onModelSelect(model);
    onCustomBrandNameChange("");
    onCustomModelNameChange("");
    onCustomEntryChange(false);
  };

  const renderBrandItem = ({ item }: { item: VehicleBrandModel }) => {
    const isSelected = item.id === selectedBrandId;

    return (
      <Pressable
        onPress={() => handleBrandPress(item)}
        style={({ pressed }) => [
          styles.brandItem,
          {
            backgroundColor: isSelected
              ? withOpacity(theme.primary, 0.15)
              : theme.card,
            borderColor: isSelected ? theme.primary : theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.brandLogo} />
        ) : (
          <View
            style={[
              styles.brandLogoPlaceholder,
              { backgroundColor: withOpacity(theme.muted, 0.3) },
            ]}
          >
            <AppIcon icon="Car" size={24} color={theme.mutedForeground} />
          </View>
        )}
        <AppText
          variant="bodyMedium"
          style={[
            styles.brandName,
            isSelected && { color: theme.primary, fontWeight: "600" },
          ]}
        >
          {item.name}
        </AppText>
        {isSelected && <AppIcon icon="Check" size={20} color={theme.primary} />}
      </Pressable>
    );
  };

  const renderModelItem = ({ item }: { item: VehicleModelModel }) => {
    const isSelected = item.id === selectedModelId;

    return (
      <Pressable
        onPress={() => handleModelSelect(item)}
        style={({ pressed }) => [
          styles.modelItem,
          {
            backgroundColor: isSelected
              ? withOpacity(theme.primary, 0.15)
              : theme.card,
            borderColor: isSelected ? theme.primary : theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <AppText
          variant="bodyMedium"
          style={isSelected && { color: theme.primary, fontWeight: "600" }}
        >
          {item.name}
        </AppText>
        {isSelected && <AppIcon icon="Check" size={20} color={theme.primary} />}
      </Pressable>
    );
  };

  if (isLoadingLookups && brands.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Custom Brand + Model Entry View
  if (isCustomEntry) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.customModelContainer}>
          <AppText variant="bodyMedium" style={styles.customModelTitle}>
            {t("addVehicle.enterCustomVehicle")}
          </AppText>
          <AppText
            variant="bodySmall"
            color="muted"
            style={styles.customModelSubtitle}
          >
            {t("addVehicle.customVehicleHint")}
          </AppText>

          {/* Brand Name Input */}
          <AppText variant="bodySmall" color="muted" style={styles.inputLabel}>
            {t("addVehicle.brandName")}
          </AppText>
          <AppInput style={styles.customModelInput}>
            <InputLeftAction>
              <AppIcon
                icon="Building2"
                size={20}
                color={theme.mutedForeground}
              />
            </InputLeftAction>
            <InputField
              placeholder={t("addVehicle.brandNamePlaceholder")}
              value={customBrandName}
              onChangeText={onCustomBrandNameChange}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </AppInput>

          {/* Model Name Input */}
          <AppText variant="bodySmall" color="muted" style={styles.inputLabel}>
            {t("addVehicle.modelName")}
          </AppText>
          <AppInput style={styles.customModelInput}>
            <InputLeftAction>
              <AppIcon icon="Car" size={20} color={theme.mutedForeground} />
            </InputLeftAction>
            <InputField
              placeholder={t("addVehicle.modelNamePlaceholder")}
              value={customModelName}
              onChangeText={onCustomModelNameChange}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </AppInput>

          <Pressable onPress={handleBackToList} style={styles.backToListButton}>
            <AppIcon icon="ArrowLeft" size={16} color={theme.primary} />
            <AppText variant="bodySmall" color="primary">
              {t("addVehicle.backToBrandList")}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Model List View
  if (showModels && selectedBrand) {
    return (
      <View style={styles.container}>
        {/* Selected Brand Header */}
        <Pressable
          onPress={handleBackToBrands}
          style={[styles.selectedBrandHeader, { backgroundColor: theme.card }]}
        >
          <View style={styles.selectedBrandInfo}>
            {selectedBrand.logoUrl ? (
              <Image
                source={{ uri: selectedBrand.logoUrl }}
                style={styles.selectedBrandLogo}
              />
            ) : (
              <View
                style={[
                  styles.selectedBrandLogoPlaceholder,
                  { backgroundColor: withOpacity(theme.muted, 0.3) },
                ]}
              >
                <AppIcon icon="Car" size={20} color={theme.mutedForeground} />
              </View>
            )}
            <AppText variant="bodyLarge" style={{ fontWeight: "600" }}>
              {selectedBrand.name}
            </AppText>
          </View>
          <View style={styles.changeBrandButton}>
            <AppText variant="bodySmall" color="primary">
              {t("addVehicle.changeBrand")}
            </AppText>
            <AppIcon icon="ChevronRight" size={16} color={theme.primary} />
          </View>
        </Pressable>

        {/* Model List */}
        <AppText variant="bodySmall" color="muted" style={styles.sectionLabel}>
          {t("addVehicle.selectModel")}
        </AppText>

        {isLoadingLookups ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={models}
            renderItem={renderModelItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }

  // Brand List View
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <AppInput style={styles.searchInput}>
        <InputLeftAction>
          <AppIcon icon="Search" size={20} color={theme.mutedForeground} />
        </InputLeftAction>
        <InputField
          placeholder={t("addVehicle.searchBrand")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </AppInput>

      {/* Brand List with Footer Button */}
      <FlatList
        data={filteredBrands}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.brandRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.customEntryButtonContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShowCustomEntry}
              style={[
                styles.cantFindButton,
                { backgroundColor: withOpacity(theme.muted, 0.2) },
              ]}
            >
              <AppIcon icon="Plus" size={20} color={theme.primary} />
              <View style={styles.cantFindTextContainer}>
                <AppText variant="bodyMedium" style={{ fontWeight: "600" }}>
                  {t("addVehicle.cantFindBrand")}
                </AppText>
                <AppText variant="bodySmall" color="muted">
                  {t("addVehicle.enterManually")}
                </AppText>
              </View>
              <AppIcon
                icon="ChevronRight"
                size={20}
                color={theme.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
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
