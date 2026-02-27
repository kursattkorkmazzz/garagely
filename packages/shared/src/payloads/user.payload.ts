import * as yup from 'yup';
import { DistanceUnit, Theme } from '../models/user.model.js';

export const updateUserPayloadValidator = yup.object({
  fullName: yup.string().min(2).max(100).optional(),
  avatarUrl: yup.string().url().nullable().optional(),
});

export type UpdateUserPayload = yup.InferType<typeof updateUserPayloadValidator>;

export const updateUserPreferencesPayloadValidator = yup.object({
  locale: yup.string().min(2).max(10).optional(),
  preferredDistanceUnit: yup
    .string()
    .oneOf(Object.values(DistanceUnit) as string[])
    .optional(),
  preferredCurrency: yup.string().min(2).max(10).optional(),
  theme: yup.string().oneOf(Object.values(Theme) as string[]).optional(),
});

export type UpdateUserPreferencesPayload = yup.InferType<
  typeof updateUserPreferencesPayloadValidator
>;

export const createUserPayloadValidator = yup.object({
  fullName: yup.string().min(2).max(100).required(),
  email: yup.string().email().required(),
  avatarUrl: yup.string().url().nullable().optional(),
});

export type CreateUserPayload = yup.InferType<typeof createUserPayloadValidator>;
