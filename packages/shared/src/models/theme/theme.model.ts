import * as yup from "yup";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export const themeValidator = yup
  .string()
  .oneOf(Object.values(Theme) as Theme[])
  .required();
