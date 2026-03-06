import {
  AppAvatar,
  AppAvatarFallback,
  AppAvatarImage,
} from "@/components/ui/app-avatar";
import {
  AppCard,
  AppCardAction,
  AppCardHeader,
  AppCardTitle,
} from "@/components/ui/app-card";
import { AppIcon } from "@/components/ui/app-icon";
import { AppView } from "@/components/ui/app-view";
import { useThemedStylesheet } from "@/theme/hooks/use-themed-stylesheet";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";
import { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

type ListItemBase = {
  id: string | number;
  name: string;
};

type ListItemProps<T extends ListItemBase> = {
  item: T;
  onClick?: (item: T) => void;
  isSelected?: boolean;
  RightAction?: ReactNode;
};

export function ListItem<T extends ListItemBase>({
  item,
  onClick,
  isSelected,
  RightAction,
}: ListItemProps<T>) {
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
    <Pressable
      onPress={() => {
        onClick?.(item);
      }}
    >
      <AppCard style={style.cardContainer}>
        <AppCardHeader
          style={{
            paddingVertical: spacing.md,
          }}
        >
          <AppView
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            {RightAction}
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
