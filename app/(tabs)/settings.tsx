import { AppListItem } from "@/components/list/list-item";
import { useMemo } from "react";
import { SectionList, View } from "react-native";

export default function SettingsPage() {
  const menuData = useMemo(
    () => [
      {
        title: "General",
        data: [
          {
            key: "language",
            label: "Language",
          },
        ],
      },
    ],
    [],
  );

  return (
    <View>
      <SectionList
        sections={menuData}
        renderItem={(item) => {
          return <AppListItem />;
        }}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}
