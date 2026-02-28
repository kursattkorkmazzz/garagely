import * as yup from "yup";
import { firestoreDate } from "../../validators/firestore-date";

export const costModelValidator = yup.object({
  id: yup.string().required(),
  amount: yup.number().min(0).required(),
  currencyId: yup.string().required(),
  createdAt: firestoreDate().required(),
});

export type CostModel = yup.InferType<typeof costModelValidator>;
