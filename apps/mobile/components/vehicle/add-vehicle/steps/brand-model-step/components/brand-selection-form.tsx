import {
  AppAvatar,
  AppAvatarFallback,
  AppAvatarImage,
} from "@/components/ui/app-avatar";
import { AppButton } from "@/components/ui/app-button";
import {
  AppCard,
  AppCardAction,
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
import { useThemedStylesheet } from "@/theme/hooks/use-themed-stylesheet";
import { useTheme } from "@/theme/theme-context";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type BrandItem = {
  id: string;
  name: string;
  photoUrl: string;
};

type BrandSelectionForm = {
  onSwitchManualyButtonClick?: () => void;
};

const MOCK_BRANDS = [
  {
    id: "1",
    name: "BMW",
    photoUrl:
      "https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-bmw-vector-transparent-PNG.png",
  },
  {
    id: "2",
    name: "Audi",
    photoUrl:
      "https://w7.pngwing.com/pngs/665/220/png-transparent-audi-logo-audi-a3-car-emblem-logo-audi-car-logo-brand-text-candle-automobile-repair-shop.png",
  },
];
export function BrandSelectionForm(props: BrandSelectionForm) {
  const { theme } = useTheme();

  const [data, setData] = useState<BrandItem[]>([]); // TODO: Fetch the brand list from backend!

  const formik = useFormikContext();
  const [selectedData, setSelectedData] = useState<BrandItem | null>(null);
  const [brandSearchText, setBrandSearchText] = useState<string>("");

  useEffect(() => {
    if (!selectedData) return;
    formik.setFieldValue("selectedBrand", selectedData.id);
    formik.setFieldValue("selectedModel", selectedData.id);
  }, [selectedData]);

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
      switchButton: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        justifyContent: "flex-start",
        paddingHorizontal: spacing.sm,
      },
      switchButtonText: {
        flex: 1,
        flexGrow: 1,
        color: theme.primaryForeground,
      },
    }),
  );

  return (
    <>
      {/* Brand Search Field */}
      <AppInput
        AppInputField={
          <AppInputField
            placeholder="Search for brand"
            onChangeText={(text) => {
              setBrandSearchText(text);
            }}
            InputLeftAction={
              <AppInputLeftAction>
                <AppIcon icon="Search" />
              </AppInputLeftAction>
            }
          />
        }
      />

      <AppFlatList<BrandItem>
        data={data}
        renderItem={({ item }) => (
          <BrandModelListItem
            item={item}
            onClick={() => setSelectedData(item)}
            isSelected={item.id === selectedData?.id}
          />
        )}
        contentContainerStyle={style.flatListContentContainerStyle}
        ListEmptyComponent={() =>
          brandSearchText === "" ? (
            <AppText
              variant="buttonSmall"
              color="muted"
              style={{ textAlign: "center", width: "100%" }}
            >
              Please type something to search brands.
            </AppText>
          ) : (
            <AppButton
              variant="primary"
              style={style.switchButton}
              onPress={() => {
                props.onSwitchManualyButtonClick?.();
              }}
            >
              <AppIcon icon="Plus" size={24} color={theme.primaryForeground} />
              <AppText style={style.switchButtonText}>
                Can't find your brand? Add it manually.
              </AppText>
              <AppIcon
                icon="ArrowRight"
                size={24}
                color={theme.primaryForeground}
              />
            </AppButton>
          )
        }
        style={style.flatListStyle}
      />
    </>
  );
}

type BrandModelListItemProps = {
  item: BrandItem;
  onClick?: (item: BrandItem) => void;
  isSelected?: boolean;
};

function BrandModelListItem({
  item,
  onClick,
  isSelected,
}: BrandModelListItemProps) {
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
    <Pressable onPress={() => onClick?.(item)}>
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
              <AppAvatarImage src={item.photoUrl} />
              <AppAvatarFallback fallbackText={item.name} />
            </AppAvatar>
            <AppView style={{ flex: 1 }}>
              <AppCardTitle>{item.name}</AppCardTitle>
            </AppView>
          </AppView>
          {isSelected && (
            <AppCardAction>
              <AppIcon icon={"Check"} size={20} color={theme.accent} />
            </AppCardAction>
          )}
        </AppCardHeader>
      </AppCard>
    </Pressable>
  );
}
