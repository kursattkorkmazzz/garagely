import * as yup from "yup";
import {
  userPreferencesModelValidator,
  type UserPreferencesModel,
} from "../user-preferences/index";
import { firestoreDate } from "../../validators/firestore-date";

export const userModelValidator = yup.object({
  id: yup.string().required(),
  fullName: yup.string().min(2).max(100).required(),
  email: yup.string().email().required(),
  createdAt: firestoreDate().required(),
  updatedAt: firestoreDate().required(),
});

export type UserModel = yup.InferType<typeof userModelValidator>;

export const userWithPreferencesModelValidator = userModelValidator.shape({
  preferences: userPreferencesModelValidator.nullable().defined(),
});

export type UserWithPreferences = yup.InferType<
  typeof userWithPreferencesModelValidator
>;

export { UserPreferencesModel };
