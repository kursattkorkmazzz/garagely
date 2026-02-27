import * as yup from "yup";
import {
  userPreferencesModelValidator,
  type UserPreferencesModel,
} from "../user-preferences/index";

export const userModelValidator = yup.object({
  id: yup.string().required(),
  fullName: yup.string().min(2).max(100).required(),
  email: yup.string().email().required(),
  createdAt: yup.date().required(),
  updatedAt: yup.date().required(),
});

export type UserModel = yup.InferType<typeof userModelValidator>;

export const userWithPreferencesModelValidator = userModelValidator.shape({
  preferences: userPreferencesModelValidator.nullable().defined(),
});

export type UserWithPreferences = yup.InferType<
  typeof userWithPreferencesModelValidator
>;

export { UserPreferencesModel };
