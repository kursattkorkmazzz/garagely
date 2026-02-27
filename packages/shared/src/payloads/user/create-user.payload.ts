import * as yup from "yup";

export const createUserPayloadValidator = yup.object({
  fullName: yup.string().min(2).max(100).required(),
  email: yup.string().email().required(),
  avatarUrl: yup.string().url().nullable().optional(),
});

export type CreateUserPayload = yup.InferType<typeof createUserPayloadValidator>;
