import * as yup from "yup";

export const currencyModelValidator = yup.object({
  id: yup.string().required(),
  code: yup.string().min(2).max(5).required(),
});

export type CurrencyModel = yup.InferType<typeof currencyModelValidator>;
