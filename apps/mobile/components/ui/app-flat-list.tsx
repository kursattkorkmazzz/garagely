import React from "react";
import { FlatList, FlatListProps } from "react-native";

type AppFlatListItemBase = { id: string };

// AppFlatList - Container component
type AppFlatListProps<Item extends AppFlatListItemBase> = FlatListProps<Item>;

export function AppFlatList<Item extends AppFlatListItemBase>({
  data,
  renderItem,
  ...props
}: AppFlatListProps<Item>) {
  return (
    <FlatList<Item>
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      {...props}
    />
  );
}
