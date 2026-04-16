import { Text, TextProps } from "react-native";

type AppTextProps = TextProps;
export function AppText({ style, ...rest }: AppTextProps) {
  return <Text {...rest} style={style} />;
}
