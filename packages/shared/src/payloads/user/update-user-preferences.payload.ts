import * as yup from "yup";
import { Theme } from "../../models/theme/index";

export const updateUserPreferencesPayloadValidator = yup.object({
  locale: yup.string().min(2).max(10).optional(),
  preferredDistanceUnitId: yup.string().optional(),
  preferredVolumeUnitId: yup.string().optional(),
  preferredCurrencyId: yup.string().optional(),
  theme: yup
    .string()
    .oneOf(Object.values(Theme) as string[])
    .optional(),
});

export type UpdateUserPreferencesPayload = yup.InferType<
  typeof updateUserPreferencesPayloadValidator
>;
