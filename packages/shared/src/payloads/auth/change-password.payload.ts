import * as yup from "yup";

export const changePasswordPayloadValidator = yup.object({
  currentPassword: yup.string().required(),
  newPassword: yup.string().min(6).max(100).required(),
});

export type ChangePasswordPayload = yup.InferType<typeof changePasswordPayloadValidator>;
