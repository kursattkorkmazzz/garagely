import { SectionList, SectionListProps } from "react-native";

type AppSectionListDataItem = {
  key: string;
  [data: string]: any;
};

type AppSectionListProps<
  TItem extends AppSectionListDataItem,
  TSection,
> = SectionListProps<TItem, TSection>;

export function AppSectionList<TItem extends AppSectionListDataItem, TSection>(
  props: AppSectionListProps<TItem, TSection>,
) {
  return <SectionList {...props} keyExtractor={(item) => item.key} />;
}
