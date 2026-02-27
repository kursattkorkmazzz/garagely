import * as yup from "yup";
import { DistanceUnit } from "../../models/distance-unit/index";
import { Theme } from "../../models/theme/index";

export const updateUserPreferencesPayloadValidator = yup.object({
  locale: yup.string().min(2).max(10).optional(),
  preferredDistanceUnit: yup
    .string()
    .oneOf(Object.values(DistanceUnit) as string[])
    .optional(),
  preferredCurrency: yup.string().min(2).max(10).optional(),
  theme: yup
    .string()
    .oneOf(Object.values(Theme) as string[])
    .optional(),
});

export type UpdateUserPreferencesPayload = yup.InferType<
  typeof updateUserPreferencesPayloadValidator
>;
