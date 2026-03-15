import * as yup from "yup";
import { Theme } from "../../models/theme/index";
import { DistanceUnit, VolumeUnit, Currency } from "../../models/unit";

export const updateUserPreferencesPayloadValidator = yup.object({
  locale: yup.string().min(2).max(10).optional(),
  dateLocale: yup.string().min(2).max(10).optional(),
  preferredDistanceUnit: yup
    .string()
    .oneOf(Object.values(DistanceUnit) as DistanceUnit[])
    .optional(),
  preferredVolumeUnit: yup
    .string()
    .oneOf(Object.values(VolumeUnit) as VolumeUnit[])
    .optional(),
  preferredCurrency: yup
    .string()
    .oneOf(Object.values(Currency) as Currency[])
    .optional(),
  theme: yup
    .string()
    .oneOf(Object.values(Theme) as string[])
    .optional(),
});

export type UpdateUserPreferencesPayload = yup.InferType<
  typeof updateUserPreferencesPayloadValidator
>;
