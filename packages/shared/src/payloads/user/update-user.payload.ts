import * as yup from "yup";

export const updateUserPayloadValidator = yup.object({
  fullName: yup.string().min(2).max(100).optional(),
  avatarUrl: yup.string().url().nullable().optional(),
});

export type UpdateUserPayload = yup.InferType<typeof updateUserPayloadValidator>;
