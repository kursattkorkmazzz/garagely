import {
  Button as PrimitiveButton,
  ButtonProps as PrimitiveButtonProps,
} from "react-native";

type ButtonProps = PrimitiveButtonProps;
export function Button(props: ButtonProps) {
  return <PrimitiveButton {...props} />;
}
