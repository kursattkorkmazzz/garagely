import { EnumPickerRow } from "@/components/enum-picker-row/enum-picker-row";
import {
  AppMediaGalleryField,
  MediaGalleryLabels,
  MediaItem,
} from "@/components/media-gallery-field/AppMediaGalleryField";
import { SelectItem } from "@/components/sheets/components/SelectItem";
import { AppButton } from "@/components/ui/app-button";
import { AppField } from "@/components/ui/app-field/app-field";
import { AppFieldError } from "@/components/ui/app-field/app-field-error";
import { AppFieldGroup } from "@/components/ui/app-field/app-field-group";
import { AppFieldLabel } from "@/components/ui/app-field/app-field-label";
import { AppInputField, AppInputGroup } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { AppToggle } from "@/components/ui/app-toggle";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { Station } from "@/features/station/entity/station.entity";
import { StationService } from "@/features/station/service/station.service";
import {
  ALL_STATION_TYPES,
  StationType,
} from "@/features/station/types/station-type";
import { stationTagScope } from "@/features/station/utils/station-tag-scope";
import { TagInput, TagInputLabels } from "@/features/tag/components/TagInput";
import { useI18n } from "@/i18n";
import { APP_HEADER_HEIGHT } from "@/layouts/header/app-header";
import { useStationStore } from "@/stores/station.store";
import { handleUIError } from "@/utils/handle-ui-error";
import { router } from "expo-router";
import { Formik, useFormikContext } from "formik";
import { Star } from "lucide-react-native/icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { createStationFormSchema } from "./station-form.schema";
import { STATION_FORM_EMPTY, StationFormValues } from "./station-form.types";

type StationFormScreenProps = {
  id: string;
  initialType?: StationType;
};

export function StationFormScreen({ id, initialType }: StationFormScreenProps) {
  const isNew = id === "new";
  const { t } = useI18n("station");
  const validationSchema = useMemo(() => createStationFormSchema(t), [t]);
  const [initialValues, setInitialValues] = useState<StationFormValues>(() =>
    isNew && initialType
      ? { ...STATION_FORM_EMPTY, type: initialType }
      : STATION_FORM_EMPTY,
  );
  const [loading, setLoading] = useState(!isNew);

  const { create, update } = useStationStore();

  useEffect(() => {
    if (isNew) return;
    StationService.getById(id)
      .then((station) => {
        if (station) setInitialValues(stationToFormValues(station));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (values: StationFormValues) => {
    const dto = formValuesToDto(values);
    if (isNew) {
      await create(dto)
        .then(() => router.back())
        .catch(handleUIError);
    } else {
      await update(id, dto)
        .then(() => router.back())
        .catch(handleUIError);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      <StationFormFields isNew={isNew} />
    </Formik>
  );
}

function StationFormFields({ isNew }: { isNew: boolean }) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    isSubmitting,
  } = useFormikContext<StationFormValues>();
  const { t } = useI18n("station");
  const { theme } = useUnistyles();

  const showTypeSheet = () => {
    SheetManager.show("select-sheet", {
      payload: {
        sections: [
          {
            data: ALL_STATION_TYPES.map((value) => ({
              key: value,
              label: t(`type.${value}`),
              isSelected: values.type === value,
              onSelectItem: () => {
                if (values.type !== value) {
                  // type değişti → mevcut tag'ler farklı scope'ta kalır, temizle
                  setFieldValue("existingTagIds", []);
                  setFieldValue("newTagNames", []);
                }
                setFieldValue("type", value);
                SheetManager.hide("select-sheet");
              },
            })),
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderItem: ({ item }: any) => (
          <SelectItem
            label={item.label as string}
            selected={item.isSelected as boolean}
            onPress={item.onSelectItem as () => void}
          />
        ),
      },
    });
  };

  const mediaLabels: MediaGalleryLabels = useMemo(
    () => ({
      addMedia: t("media.addLabel"),
      setCover: t("media.setCover"),
      removeMedia: t("media.removeMedia"),
      preview: t("media.preview"),
      coverBadge: t("media.coverBadge"),
      emptyTitle: t("media.emptyTitle"),
      emptySub: t("media.emptySub"),
      // MediaPickerLabels (forwarded from components ns inside the hook)
      pickFromLibrary: t("components:mediaPicker.pickFromLibrary"),
      takePhoto: t("components:mediaPicker.takePhoto"),
      selectFromGallery: t("components:mediaPicker.selectFromGallery"),
      pickDocument: t("components:mediaPicker.pickDocument"),
      uploadWarningTitle: t("components:mediaPicker.uploadWarningTitle"),
      uploadWarningMessage: t("components:mediaPicker.uploadWarningMessage"),
      continueText: t("components:mediaPicker.continue"),
      cancelText: t("components:mediaPicker.cancel"),
      pickerTitle: t("components:mediaPicker.pickerTitle"),
    }),
    [t],
  );

  const tagLabels: TagInputLabels = useMemo(
    () => ({
      addNewPlaceholder: t("tag:input.addNewPlaceholder"),
      addButton: t("tag:input.addButton"),
      selectedTitle: t("tag:input.selectedTitle"),
      suggestionsTitle: t("tag:input.suggestionsTitle"),
      emptySuggestions: t("tag:input.emptySuggestions"),
      emptySelected: t("tag:input.emptySelected"),
    }),
    [t],
  );

  const tagScope = values.type ? stationTagScope(values.type) : "";

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={APP_HEADER_HEIGHT}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Media */}
        <AppFieldGroup label={t("sections.media")}>
          <AppMediaGalleryField
            value={values.media}
            coverAssetId={values.coverAssetId}
            onChange={(items, coverId) => {
              setFieldValue("media", items);
              setFieldValue("coverAssetId", coverId);
            }}
            labels={mediaLabels}
          />
        </AppFieldGroup>

        {/* Basic Info */}
        <AppFieldGroup label={t("sections.basicInfo")}>
          <StationField
            label={t("fields.name")}
            placeholder={t("placeholders.name")}
            value={values.name}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            error={
              touched.name ? (errors.name as string | undefined) : undefined
            }
          />
          <EnumPickerRow
            label={t("fields.type")}
            value={values.type ? t(`type.${values.type}`) : ""}
            error={
              touched.type ? (errors.type as string | undefined) : undefined
            }
            onPress={showTypeSheet}
          />
          <StationField
            label={t("fields.brand")}
            placeholder={t("placeholders.brand")}
            value={values.brand}
            onChangeText={handleChange("brand")}
            onBlur={handleBlur("brand")}
          />
        </AppFieldGroup>

        {/* Location */}
        <AppFieldGroup label={t("sections.location")}>
          <StationField
            label={t("fields.address")}
            placeholder={t("placeholders.address")}
            value={values.address}
            onChangeText={handleChange("address")}
            onBlur={handleBlur("address")}
          />
          <StationField
            label={t("fields.city")}
            placeholder={t("placeholders.city")}
            value={values.city}
            onChangeText={handleChange("city")}
            onBlur={handleBlur("city")}
          />
          <StationField
            label={t("fields.latitude")}
            placeholder={t("placeholders.latitude")}
            value={values.latitude}
            onChangeText={handleChange("latitude")}
            onBlur={handleBlur("latitude")}
            error={
              touched.latitude
                ? (errors.latitude as string | undefined)
                : undefined
            }
            keyboardType="numbers-and-punctuation"
          />
          <StationField
            label={t("fields.longitude")}
            placeholder={t("placeholders.longitude")}
            value={values.longitude}
            onChangeText={handleChange("longitude")}
            onBlur={handleBlur("longitude")}
            error={
              touched.longitude
                ? (errors.longitude as string | undefined)
                : undefined
            }
            keyboardType="numbers-and-punctuation"
          />
        </AppFieldGroup>

        {/* Contact */}
        <AppFieldGroup label={t("sections.contact")}>
          <StationField
            label={t("fields.phone")}
            placeholder={t("placeholders.phone")}
            value={values.phone}
            onChangeText={handleChange("phone")}
            onBlur={handleBlur("phone")}
            keyboardType="phone-pad"
          />
          <StationField
            label={t("fields.website")}
            placeholder={t("placeholders.website")}
            value={values.website}
            onChangeText={handleChange("website")}
            onBlur={handleBlur("website")}
            autoCapitalize="none"
            keyboardType="url"
          />
        </AppFieldGroup>

        {/* Rating + Tags + Favorite */}
        <AppFieldGroup label={t("sections.rating")}>
          <AppField>
            <AppFieldLabel>{t("fields.rating")}</AppFieldLabel>
            <RatingField
              value={values.rating}
              onChange={(v) => setFieldValue("rating", v)}
            />
            {touched.rating && errors.rating ? (
              <AppFieldError>{errors.rating as string}</AppFieldError>
            ) : null}
          </AppField>

          <AppField>
            <View style={styles.toggleRow}>
              <AppFieldLabel>{t("fields.isFavorite")}</AppFieldLabel>
              <AppToggle
                value={values.isFavorite}
                onValueChange={(v) => setFieldValue("isFavorite", v)}
              />
            </View>
          </AppField>

          <AppField>
            <AppFieldLabel>{t("fields.tags")}</AppFieldLabel>
            {tagScope ? (
              <TagInput
                scope={tagScope}
                selectedExistingIds={values.existingTagIds}
                newTagNames={values.newTagNames}
                onChange={(existingIds, newNames) => {
                  setFieldValue("existingTagIds", existingIds);
                  setFieldValue("newTagNames", newNames);
                }}
                labels={tagLabels}
              />
            ) : (
              <AppText style={{ color: theme.colors.mutedForeground }}>
                {t("errors.type")}
              </AppText>
            )}
          </AppField>
        </AppFieldGroup>

        {/* Notes */}
        <AppFieldGroup label={t("sections.other")}>
          <AppField>
            <AppFieldLabel>{t("fields.notes")}</AppFieldLabel>
            <AppInputGroup>
              <AppInputField
                placeholder={t("placeholders.notes")}
                value={values.notes}
                onChangeText={handleChange("notes")}
                onBlur={handleBlur("notes")}
                multiline
                numberOfLines={4}
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </AppInputGroup>
          </AppField>
        </AppFieldGroup>

        <AppButton
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onPress={() => handleSubmit()}
          style={styles.submitButton}
        >
          {isNew ? t("actions.create") : t("actions.save")}
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type StationFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  [key: string]: unknown;
};

function StationField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  ...rest
}: StationFieldProps) {
  return (
    <AppField>
      <AppFieldLabel>{label}</AppFieldLabel>
      <AppInputGroup>
        <AppInputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          {...rest}
        />
      </AppInputGroup>
      {error ? <AppFieldError>{error}</AppFieldError> : null}
    </AppField>
  );
}

function RatingField({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= value;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(value === n ? null : n)}
            style={styles.ratingStar}
          >
            <Star
              size={28}
              color={
                filled ? theme.colors.primary : theme.colors.mutedForeground
              }
              fill={filled ? theme.colors.primary : "transparent"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function stationToFormValues(s: Station): StationFormValues {
  const media: MediaItem[] = (s.media ?? []).map((a) => ({
    id: a.id,
    uri: a.fullPath,
    type:
      a.type === AssetTypes.VIDEO
        ? "video"
        : a.type === AssetTypes.DOCUMENT
          ? "document"
          : "image",
    name: a.fullName,
  }));
  return {
    name: s.name,
    type: s.type,
    brand: s.brand ?? "",
    address: s.address ?? "",
    city: s.city ?? "",
    latitude:
      s.latitude !== null && s.latitude !== undefined ? String(s.latitude) : "",
    longitude:
      s.longitude !== null && s.longitude !== undefined
        ? String(s.longitude)
        : "",
    phone: s.phone ?? "",
    website: s.website ?? "",
    notes: s.notes ?? "",
    rating: s.rating ?? null,
    isFavorite: s.isFavorite,
    media,
    coverAssetId: s.coverAssetId ?? null,
    existingTagIds: (s.tags ?? []).map((t) => t.id),
    newTagNames: [],
  };
}

function formValuesToDto(values: StationFormValues) {
  const lat = values.latitude.trim();
  const lng = values.longitude.trim();
  return {
    name: values.name.trim(),
    type: values.type as StationType,
    brand: values.brand.trim() || null,
    address: values.address.trim() || null,
    city: values.city.trim() || null,
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    phone: values.phone.trim() || null,
    website: values.website.trim() || null,
    notes: values.notes.trim() || null,
    rating: values.rating,
    isFavorite: values.isFavorite,
    coverAssetId: values.coverAssetId,
    mediaAssetIds: values.media.map((m) => m.id),
    existingTagIds: values.existingTagIds,
    newTagNames: values.newTagNames,
  };
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  ratingStar: {
    padding: theme.spacing.xxs,
  },
}));
