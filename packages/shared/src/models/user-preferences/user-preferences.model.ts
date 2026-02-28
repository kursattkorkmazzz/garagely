import * as yup from "yup";
import { Theme, themeValidator } from "../theme/index";
import { firestoreDate } from "../../validators/firestore-date";

export const userPreferencesModelValidator = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  locale: yup.string().min(2).max(10).required(),
  preferredDistanceUnitId: yup.string().required(),
  preferredVolumeUnitId: yup.string().required(),
  preferredCurrencyId: yup.string().required(),
  theme: themeValidator,
  createdAt: firestoreDate().required(),
  updatedAt: firestoreDate().required(),
});

export type UserPreferencesModel = yup.InferType<
  typeof userPreferencesModelValidator
>;

export { Theme };
