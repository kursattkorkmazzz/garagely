import * as yup from "yup";
import {
  DistanceUnit,
  distanceUnitValidator,
} from "../distance-unit/index.js";
import { Theme, themeValidator } from "../theme/index.js";

export const userPreferencesModelValidator = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  locale: yup.string().min(2).max(10).required(),
  preferredDistanceUnit: distanceUnitValidator,
  preferredCurrency: yup.string().min(2).max(10).required(),
  theme: themeValidator,
  createdAt: yup.date().required(),
  updatedAt: yup.date().required(),
});

export type UserPreferencesModel = yup.InferType<
  typeof userPreferencesModelValidator
>;

export { DistanceUnit, Theme };
