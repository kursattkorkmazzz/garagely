import * as yup from "yup";
import { Theme, themeValidator } from "../theme/index";
import { firestoreDate } from "../../validators/firestore-date";
import {
  distanceUnitValidator,
  volumeUnitValidator,
  currencyValidator,
} from "../unit";

export const userPreferencesModelValidator = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  locale: yup.string().min(2).max(10).required(),
  dateLocale: yup.string().min(2).max(10).required(),
  preferredDistanceUnit: distanceUnitValidator,
  preferredVolumeUnit: volumeUnitValidator,
  preferredCurrency: currencyValidator,
  theme: themeValidator,
  createdAt: firestoreDate().required(),
  updatedAt: firestoreDate().required(),
});

export type UserPreferencesModel = yup.InferType<
  typeof userPreferencesModelValidator
>;

export { Theme };
