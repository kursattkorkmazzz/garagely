import * as yup from "yup";

export const loginPayloadValidator = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export type LoginPayload = yup.InferType<typeof loginPayloadValidator>;
