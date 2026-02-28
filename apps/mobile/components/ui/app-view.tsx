import { View, ViewProps, StyleSheet, FlexStyle } from "react-native";

type JustifyContent =
  | "center"
  | "start"
  | "end"
  | "between"
  | "around"
  | "evenly";

type AlignItems = "center" | "start" | "end" | "stretch" | "baseline";

type AppViewProps = ViewProps & {
  justify?: JustifyContent;
  align?: AlignItems;
};

const justifyMap: Record<JustifyContent, FlexStyle["justifyContent"]> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const alignMap: Record<AlignItems, FlexStyle["alignItems"]> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

export function AppView({ justify, align, style, ...rest }: AppViewProps) {
  const layoutStyle = StyleSheet.create({
    container: {
      justifyContent: justify ? justifyMap[justify] : undefined,
      alignItems: align ? alignMap[align] : undefined,
    },
  });

  return <View {...rest} style={[layoutStyle.container, style]} />;
}
