import * as yup from "yup";

export const registerPayloadValidator = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).max(100).required(),
  fullName: yup.string().min(2).max(100).required(),
});

export type RegisterPayload = yup.InferType<typeof registerPayloadValidator>;
